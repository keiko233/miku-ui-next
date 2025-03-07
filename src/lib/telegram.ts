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
export const getChannelLastPostId = async (
  channel: string,
): Promise<number | null> => {
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
 * Retrieves the raw content of a Telegram post.
 *
 * This function fetches the HTML of a public Telegram post and extracts
 * the text content using regex pattern matching.
 *
 * @param channel - The Telegram channel name (without the '@' symbol)
 * @param id - The post ID (message ID) in the channel
 * @returns A Promise that resolves to the raw text content of the post if found,
 *          or undefined if the content couldn't be extracted
 *
 * @example
 * // Get content from https://t.me/channelname/123
 * const content = await getRawPostContent('channelname', 123);
 */
export const getRawPostContent = async (
  channel: string,
  id: number | string,
): Promise<string | null> => {
  const res = await fetchWithRetry(`https://t.me/s/${channel}/${id}`);
  const text = await res.text();

  const dataPost = `${channel}/${id}`;

  // 1. Match the message container that contains the data-post attribute and the value is dataPost
  // 2. Find the div that contains the class "tgme_widget_message_text" and "js-message_text" in the container
  // 3. Capture the content inside the div (use non-greedy matching)
  const regex = new RegExp(
    `<div[^>]+data-post=["']${dataPost}["'][^>]*>[\\s\\S]*?<div[^>]+class=["'][^"']*(?:tgme_widget_message_text\\s+js-message_text|js-message_text\\s+tgme_widget_message_text)[^"']*["'][^>]*>([\\s\\S]*?)<\\/div>`,
    "i",
  );

  const match = text.match(regex);

  if (match && match[1]) {
    return match[1];
  } else {
    return null;
  }
};
