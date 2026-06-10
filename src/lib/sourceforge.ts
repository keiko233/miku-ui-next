import { fetchWithRetry } from "@/utils/retry";

type FileWithUrl = {
  fileName: string;
  downloadUrl: string;
};

/**
 * Extracts file information from a SourceForge directory page.
 *
 * This function fetches the HTML content from the provided URL,
 * then parses it to extract file names and their download URLs using regex.
 * The regex is designed to match SourceForge's specific HTML structure for file listings.
 */
export const getFilesUrl = async (url: string): Promise<FileWithUrl[]> => {
  const res = await fetchWithRetry(url);
  const html = await res.text();

  const regex =
    /<tr[^>]*title="[^"]+"[^>]*class="file[^"]*"[^>]*>[\s\S]*?<a href="([^"]+)"[\s\S]*?<span class="name">([^<]+)<\/span>/g;

  const results: FileWithUrl[] = [];
  let match;

  while ((match = regex.exec(html)) !== null) {
    results.push({
      fileName: match[2],
      downloadUrl: match[1],
    });
  }

  return results;
};
