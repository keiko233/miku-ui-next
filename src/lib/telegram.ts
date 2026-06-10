import { fetchWithRetry } from "@/utils/retry";

/**
 * Retrieves the ID of the last (most recent) post from a public Telegram channel.
 *
 * This function works by fetching the public HTML page of a Telegram channel and
 * parsing it to extract all post IDs. It then returns the highest post ID,
 * which corresponds to the most recent post.
 *
 * @param channel - The username/handle of the Telegram channel (without the '@' symbol)
 * @returns A Promise that resolves to the ID of the most recent post in the channel
 * @throws Will throw an error if the fetch operation fails or if no posts are found
 *
 * @example
 * ```typescript
 * const latestPostId = await getChannelLastPostId('telegram_channel_name');
 * console.log(latestPostId); // e.g. 1234
 * ```
 */
export const getChannelLastPostId = async (channel: string): Promise<number | null> => {
  const res = await fetchWithRetry(`https://t.me/s/${channel}`);
  const text = await res.text();

  // Match the data-post attribute in the message container
  const regex = new RegExp(`data-post="${channel}/(\\d+)"`, "g");
  const matches = [...text.matchAll(regex)];
  const postIds = matches.map((match) => parseInt(match[1]));

  // Return the maximum post id
  return Math.max(...postIds) || null;
};

/**
 * Retrieves the raw content and publish date of a Telegram post.
 *
 * This function fetches the HTML of a public Telegram post and extracts
 * the text content and publish date using regex pattern matching.
 *
 * @param channel - The Telegram channel name (without the '@' symbol)
 * @param id - The post ID (message ID) in the channel
 * @returns A Promise that resolves to an object containing the raw text content and publish date (as Unix timestamp)
 *
 * @example
 * // Get content and publish date from https://t.me/channelname/123
 * const { content, publishDate } = await getRawPostContent('channelname', 123);
 */
export const getRawPostContent = async (
  channel: string,
  id: number | string,
): Promise<{
  content: string | null;
  publishDate: number | null;
}> => {
  const res = await fetchWithRetry(`https://t.me/s/${channel}/${id}`);
  const text = await res.text();

  const dataPost = `${channel}/${id}`;

  // 1. Match the message container that contains the data-post attribute and the value is dataPost
  // 2. Find the div that contains the class "tgme_widget_message_text" and "js-message_text" in the container
  // 3. Capture the content inside the div (use non-greedy matching)
  const contentRegex = new RegExp(
    `<div[^>]+data-post=["']${dataPost}["'][^>]*>[\\s\\S]*?<div[^>]+class=["'][^"']*(?:tgme_widget_message_text\\s+js-message_text|js-message_text\\s+tgme_widget_message_text)[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`,
    "i",
  );

  const contentMatch = text.match(contentRegex);

  const content = contentMatch && contentMatch[1] ? contentMatch[1] : null;

  // Match the datetime in the message date element
  const dateRegex = new RegExp(
    `<div[^>]+data-post=["']${dataPost}["'][^>]*>[\\s\\S]*?<a[^>]+class=["']tgme_widget_message_date["'][^>]*><time datetime=["']([^"']+)["']`,
    "i",
  );

  const dateMatch = text.match(dateRegex);

  // Extract and convert publish date to timestamp
  let publishDate: number | null = null;
  if (dateMatch && dateMatch[1]) {
    const dateString = dateMatch[1];
    publishDate = new Date(dateString).getTime();
  }

  return {
    content,
    publishDate,
  };
};
