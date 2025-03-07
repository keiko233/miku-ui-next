import { execSync } from "child_process";

function applyD1Migrations(dbName: string = "prisma-miku-ui"): void {
  console.log(`Applying migrations to D1 database: ${dbName}...`);

  try {
    execSync(`echo "Y" | pnpm wrangler d1 migrations apply ${dbName}`, {
      stdio: "inherit",
    });
    console.log("Migrations applied successfully.");
  } catch (error) {
    console.error("Failed to apply migrations:", error);
    process.exit(1);
  }
}

const dbName = process.argv[2] || "prisma-miku-ui";
applyD1Migrations(dbName);
