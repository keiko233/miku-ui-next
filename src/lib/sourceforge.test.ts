import { expect, test } from "vitest";
import { getFilesUrl } from "./sourceforge";

const TEST_URL =
  "https://sourceforge.net/projects/divarelease/files/sagit_Vampire_v0.6.1/";

test("get sourceforge files url", { timeout: 10000, retry: 3 }, async () => {
  const res = await getFilesUrl(TEST_URL);

  res.forEach((item) => {
    expect(item.downloadUrl).toString().startsWith(TEST_URL);
    expect(typeof item.fileName).toBe('string');
  });
});
