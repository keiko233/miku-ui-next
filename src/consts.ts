export const CHANNEL_ID = "mikuuirelease";

export const DEFAULT_PAGE_SIZE = 10;

export const DEFAULT_CARD_PAGE_SIZE = 12;

export const INIT_DATABASE_TASK_TITLE = "init-database";

export const CRAWL_CONTEXT_TASK_TITLE = "crawl-context";

export const CRAWL_TASK_STALE_AFTER_MS = 15 * 60 * 1000;

export const SCHEDULED_CRAWL_BATCH_SIZE = 5;

export const isDev = process.env.NODE_ENV === "development";
