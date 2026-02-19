-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PaymentLink" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "linkName" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "amountBCH" REAL,
    "bchAddress" TEXT NOT NULL,
    "derivationIndex" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "network" TEXT NOT NULL DEFAULT 'mainnet',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PaymentLink_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_PaymentLink" ("amountBCH", "bchAddress", "createdAt", "derivationIndex", "description", "id", "linkName", "status", "title", "userId") SELECT "amountBCH", "bchAddress", "createdAt", "derivationIndex", "description", "id", "linkName", "status", "title", "userId" FROM "PaymentLink";
DROP TABLE "PaymentLink";
ALTER TABLE "new_PaymentLink" RENAME TO "PaymentLink";
CREATE UNIQUE INDEX "PaymentLink_bchAddress_key" ON "PaymentLink"("bchAddress");
CREATE UNIQUE INDEX "PaymentLink_userId_linkName_key" ON "PaymentLink"("userId", "linkName");
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "username" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "xpub" TEXT NOT NULL,
    "mnemonicEnc" TEXT NOT NULL,
    "nextIndex" INTEGER NOT NULL DEFAULT 0,
    "network" TEXT NOT NULL DEFAULT 'mainnet',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_User" ("createdAt", "displayName", "email", "id", "mnemonicEnc", "nextIndex", "passwordHash", "username", "xpub") SELECT "createdAt", "displayName", "email", "id", "mnemonicEnc", "nextIndex", "passwordHash", "username", "xpub" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
