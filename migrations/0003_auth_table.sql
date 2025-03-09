-- CreateTable
CREATE TABLE IF NOT EXISTS User (
    id TEXT PRIMARY KEY,                   -- Unique identifier for each user
    name TEXT NOT NULL,                    -- User's chosen display name
    email TEXT NOT NULL,                   -- User's email address for communication and login
    emailVerified INTEGER NOT NULL,        -- Whether the user's email is verified (0/1)
    image TEXT,                            -- User's image url (nullable)
    createdAt TEXT NOT NULL,               -- Timestamp of when the user account was created
    updatedAt TEXT NOT NULL,               -- Timestamp of the last update to the user's information
    role TEXT DEFAULT 'user',              -- The user's role. Defaults to 'user'. Admins will have the 'admin' role.
    banned BOOLEAN,                        -- Indicates whether the user is banned.
    banReason TEXT,                        -- The reason for the user's ban.
    banExpires INTEGER                     -- The Unix timestamp when the user's ban will expire.
);

-- CreateTable
CREATE TABLE IF NOT EXISTS Session (
    id TEXT PRIMARY KEY,                   -- Unique identifier for each session
    userId TEXT NOT NULL,                  -- The id of the user (foreign key)
    token TEXT NOT NULL,                   -- The unique session token
    impersonatedBy TEXT,                   -- The ID of the admin that is impersonating this session.
    expiresAt TEXT NOT NULL,               -- The time when the session expires
    ipAddress TEXT,                        -- The IP address of the device (nullable)
    userAgent TEXT,                        -- The user agent information of the device (nullable)
    createdAt TEXT NOT NULL,               -- Timestamp of when the session was created
    updatedAt TEXT NOT NULL,               -- Timestamp of when the session was updated
    FOREIGN KEY (userId) REFERENCES User(id)
);

-- CreateTable
CREATE TABLE IF NOT EXISTS Account (
    id TEXT PRIMARY KEY,                   -- Unique identifier for each account
    userId TEXT NOT NULL,                  -- The id of the user (foreign key)
    accountId TEXT NOT NULL,               -- The id of the account as provided by the SSO or equal to userId for credential accounts
    providerId TEXT NOT NULL,              -- The id of the provider
    accessToken TEXT,                      -- The access token of the account (nullable)
    refreshToken TEXT,                     -- The refresh token of the account (nullable)
    accessTokenExpiresAt TEXT,             -- The time when the access token expires (nullable)
    refreshTokenExpiresAt TEXT,            -- The time when the refresh token expires (nullable)
    scope TEXT,                            -- The scope of the account (nullable)
    idToken TEXT,                          -- The id token returned from the provider (nullable)
    password TEXT,                         -- The password of the account (nullable)
    createdAt TEXT NOT NULL,               -- Timestamp of when the account was created
    updatedAt TEXT NOT NULL,               -- Timestamp of when the account was updated
    FOREIGN KEY (userId) REFERENCES User(id)
);

-- CreateTable
CREATE TABLE IF NOT EXISTS Verification (
    id TEXT PRIMARY KEY,                   -- Unique identifier for each verification
    identifier TEXT NOT NULL,              -- The identifier for the verification request
    value TEXT NOT NULL,                   -- The value to be verified
    expiresAt TEXT NOT NULL,               -- The time when the verification request expires
    createdAt TEXT NOT NULL,               -- Timestamp of when the verification request was created
    updatedAt TEXT NOT NULL                -- Timestamp of when the verification request was updated
);
