import { createClient } from '@libsql/client';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    const key = match[1].trim();
    let val = match[2].trim();
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    env[key] = val;
  }
});

const turso = createClient({
  url: env.TURSO_DATABASE_URL,
  authToken: env.TURSO_AUTH_TOKEN,
});

async function main() {
  console.log('🚀 Connecting to Turso:', env.TURSO_DATABASE_URL);

  // 1. Create tables
  const ddl = `
CREATE TABLE IF NOT EXISTS "Category" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "subcategories" TEXT NOT NULL,
    "metrics" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "subcategory" TEXT NOT NULL,
    "images" TEXT NOT NULL,
    "releaseYear" INTEGER NOT NULL,
    "priceEstimate" REAL NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "tags" TEXT NOT NULL,
    "specs" TEXT NOT NULL,
    "affiliateLinks" TEXT NOT NULL,
    "editorialReview" TEXT NOT NULL,
    "communityReviewCount" INTEGER NOT NULL DEFAULT 0,
    "communityRatingAverage" REAL NOT NULL DEFAULT 0,
    "editorsChoice" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "CommunityReview" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "userName" TEXT NOT NULL,
    "userAvatar" TEXT,
    "rating" REAL NOT NULL,
    "metricScores" TEXT,
    "title" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "verifiedBuyer" BOOLEAN NOT NULL DEFAULT false,
    "helpfulCount" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'approved',
    "photos" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CommunityReview_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "avatar" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE IF NOT EXISTS "AffiliateClick" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "storeName" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "userAgent" TEXT,
    "referer" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AffiliateClick_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS "Category_slug_key" ON "Category"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
`;

  const statements = ddl.split(';').map(s => s.trim()).filter(s => s.length > 0);
  for (const stmt of statements) {
    await turso.execute(stmt);
  }
  console.log('✅ Tables created/verified on Turso!');

  // 2. Dump data from local dev.db
  const devDbPath = path.resolve(process.cwd(), 'prisma/dev.db');
  if (fs.existsSync(devDbPath)) {
    console.log('📦 Transferring local seed data to Turso...');
    const rawDump = execSync('sqlite3 prisma/dev.db ".dump Category Product User CommunityReview AffiliateClick"').toString();
    const insertStatements = rawDump
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('INSERT INTO '));

    console.log(`Found ${insertStatements.length} records to sync.`);
    for (const insert of insertStatements) {
      // Use INSERT OR REPLACE so re-running is safe
      const safeInsert = insert.replace('INSERT INTO ', 'INSERT OR REPLACE INTO ');
      try {
        await turso.execute(safeInsert);
      } catch (err) {
        console.warn('Skipping duplicate or error:', err.message);
      }
    }
    console.log('✅ All data successfully synced to Turso!');
  }

  // 3. Verify
  const catCount = await turso.execute('SELECT COUNT(*) as c FROM Category');
  const prodCount = await turso.execute('SELECT COUNT(*) as c FROM Product');
  console.log(`🎉 Turso verification: ${catCount.rows[0].c} Categories, ${prodCount.rows[0].c} Products live in the cloud!`);
}

main().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
