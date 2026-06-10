import { env } from "cloudflare:workers";
import { z } from "zod";

import { CreateDeviceValues } from "@/actions/query/devices";
import { DeviceSchema } from "@/schema";

const CreateDeviceValuesSchema = DeviceSchema.omit({
  id: true,
  publishAt: true,
  createdAt: true,
  updatedAt: true,
});

const CreateDeviceValuesJsonSchema = z.toJSONSchema(CreateDeviceValuesSchema, {
  target: "draft-07",
});

const getResponsePayload = (response: unknown): unknown => {
  if (typeof response === "string") {
    return response;
  }

  if (!response || typeof response !== "object") {
    return undefined;
  }

  if ("response" in response) {
    return (response as { response?: unknown }).response;
  }

  return (response as { choices?: Array<{ message?: { content?: unknown } }> })
    .choices?.[0]
    ?.message?.content;
};

const parseJsonPayload = (payload: unknown): unknown => {
  if (typeof payload !== "string") {
    return payload;
  }

  const trimmedPayload = payload.trim();
  if (trimmedPayload === "null") {
    return null;
  }

  try {
    return JSON.parse(trimmedPayload);
  } catch (error) {
    const fencedJson = trimmedPayload.match(
      /^```(?:json)?\s*([\s\S]*?)\s*```$/i,
    )?.[1];
    if (!fencedJson) {
      throw error;
    }
    return JSON.parse(fencedJson.trim());
  }
};

export const parsePostContent = async (
  content: string,
): Promise<Omit<CreateDeviceValues, "publishAt"> | null> => {
  try {
    const response = await env.AI.run("@cf/google/gemma-4-26b-a4b-it", {
      messages: [
        {
          role: "system",
          content:
            `Extract device information from the following text and return only structured JSON that matches the provided response_format schema.
Field rules:
- codename: device codename, force lowercase.
- name: device name; do not include the codename, for example "Xiaomi Mix 4 (odin)" must be "Xiaomi Mix 4".
- version: ROM version only; never include "Miku UI" or any UI brand prefix.
- androidVersion: Android version number.
- status: either COMMUNITY or OFFICIAL.
- selinuxStatus: either Enforcing or Permissive.
- kernelsuVersion: KernelSU version number.
- sourcforgeUrl: SourceForge download link. Keep this exact key spelling.
- changelog: update changelog content with \\n for line breaks; drop extra "-" list symbols.
- note: additional notes with \\n for line breaks, or null.`,
        },
        {
          role: "user",
          content: `Content to parse:
<content>
${content}
</content>
`,
        },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "device_release",
          description: "Device release information extracted from a post",
          schema: CreateDeviceValuesJsonSchema,
          strict: true,
        },
      },
    });

    try {
      const parsedData = parseJsonPayload(getResponsePayload(response));
      if (parsedData === null) {
        return null;
      }

      const result = CreateDeviceValuesSchema.safeParse(parsedData);
      if (!result.success) {
        console.error("Data validation failed:", result.error);
        return null;
      }

      return result.data;
    } catch (parseError) {
      console.error("Data validation failed:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Failed to parse device information", {
      cause: error,
    });
  }
};
