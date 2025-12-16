import { getCloudflareContext } from "@opennextjs/cloudflare";
import { CreateDeviceValues } from "@/actions/query/devices";
import { DeviceSchema } from "@/schema";

const CreateDeviceValuesSchema = DeviceSchema.omit({
  id: true,
  publishAt: true,
  createdAt: true,
  updatedAt: true,
});

const ask = async (options: AiTextGenerationInput) => {
  const { env } = await getCloudflareContext({ async: true });

  // refence: https://developers.cloudflare.com/workers-ai/json-mode/#supported-models
  return await env.AI.run("@cf/meta/llama-3.1-8b-instruct-fp8", options);
};

export const parsePostContent = async (
  content: string,
): Promise<Omit<CreateDeviceValues, "publishAt"> | null> => {
  try {
    const response = await ask({
      prompt: `Extract device information from the following text and return it ONLY as a valid JSON object without any additional text, explanations, markdown backticks or formatting.
The response must be a valid parseable JSON object according to the following schema and nothing else:
{
  "codename": "string, device codename (e.g., 'odin'), force lowercase",
  "name": "string, device name (e.g., 'Xiaomi Mix 4'), dos not include the codename such as 'Xiaomi Mix 4 (odin)', must be 'Xiaomi Mix 4'",
  "version": "string, ROM version (e.g., 'Vampire v0.6.1'), DO NOT include 'Miku UI' prefix, return ONLY the version name like 'Vampire v0.6.1' without any UI branding",
  "androidVersion": number, Android version number (e.g., 15),
  "status": "string, either COMMUNITY or OFFICIAL",
  "selinuxStatus": "string, either Enforcing or Permissive",
  "kernelsuVersion": number, KernelSU version number,
  "sourcforgeUrl": "string, SourceForge download link",
  "changelog": "string, update changelog content with \\n for line breaks, drop the extra - symbol",
  "note": "string or null, additional notes (optional) with \\n for line breaks"
}

Content to parse:
<content>
${content}
</content>

IMPORTANT:
1. Your response must be ONLY the JSON object with no additional text. The JSON should be compressed to a single line without any line breaks or unnecessary whitespace.
2. If you cannot extract valid information from the content that matches the schema, respond only with null and nothing else.
3. For the "version" field, NEVER include "Miku UI" or any UI brand name - extract only the version name itself (e.g., "Vampire v0.6.1").`,
      // max_tokens: 1024,
      // fucking cloudflare workers AI JSON output was broken
      // response_format: {
      //   type: "json_object",
      //   json_schema: {
      //     type: "object",
      //     properties: {
      //       codename: {
      //         type: "string",
      //         description: "Device codename (e.g., 'odin')",
      //       },
      //       name: {
      //         type: "string",
      //         description: "Device name (e.g., 'Xiaomi Mix 4')",
      //       },
      //       version: {
      //         type: "string",
      //         description: "ROM version (e.g., 'Miku UI Vampire v0.6.1')",
      //       },
      //       androidVersion: {
      //         type: "integer",
      //         description: "Android version number (e.g., 15)",
      //       },
      //       status: {
      //         type: "string",
      //         enum: ["COMMUNITY", "OFFICIAL"],
      //         description: "Device status, either COMMUNITY or OFFICIAL",
      //       },
      //       selinuxStatus: {
      //         type: "string",
      //         enum: ["Enforcing", "Permissive"],
      //         description: "SELinux status, either Enforcing or Permissive",
      //       },
      //       kernelsuVersion: {
      //         type: "integer",
      //         description: "KernelSU version number",
      //       },
      //       sourcforgeUrl: {
      //         type: "string",
      //         description: "SourceForge download link",
      //       },
      //       changelog: {
      //         type: "string",
      //         description: "Update changelog content, use \\n for line breaks",
      //       },
      //       note: {
      //         type: "string",
      //         nullable: true,
      //         description: "Additional notes (optional), use \\n for line breaks",
      //       },
      //     },
      //     required: [
      //       "codename",
      //       "name",
      //       "version",
      //       "androidVersion",
      //       "status",
      //       "selinuxStatus",
      //       "kernelsuVersion",
      //       "sourcforgeUrl",
      //     ],
      //   },
      // },
    });

    console.log(response);

    // cloudflare workers AI response broken too :)
     
    let cleanedResponse = (response as any).response;

    if (cleanedResponse.startsWith('"') && cleanedResponse.endsWith('"')) {
      cleanedResponse = cleanedResponse.slice(1, -1);
    }

    cleanedResponse = cleanedResponse
      .replace(/\\n/g, "\\n")
      .replace(/\\"/g, '\\"')
      .replace(/\\r/g, "\\r")
      .replace(/\\\\/g, "\\\\");

    try {
      const parsedData = JSON.parse(cleanedResponse);
      return CreateDeviceValuesSchema.parse(parsedData);
    } catch (parseError) {
      console.error("Data validation failed:", parseError);
      return null;
    }
  } catch (error) {
    console.error("Failed to parse AI response:", error);
    throw new Error("Failed to parse device information");
  }
};
