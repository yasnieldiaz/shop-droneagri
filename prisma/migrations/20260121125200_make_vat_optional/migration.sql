-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_B2BCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "vatNumber" TEXT,
    "country" TEXT NOT NULL,
    "region" TEXT NOT NULL DEFAULT 'EU',
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "viesValidated" BOOLEAN NOT NULL DEFAULT false,
    "viesValidatedAt" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "approvedAt" DATETIME,
    "approvedBy" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "lastLoginAt" DATETIME
);
INSERT INTO "new_B2BCustomer" ("approvedAt", "approvedBy", "city", "companyName", "contactName", "contactPhone", "country", "createdAt", "email", "id", "lastLoginAt", "password", "postalCode", "region", "status", "street", "updatedAt", "vatNumber", "viesValidated", "viesValidatedAt") SELECT "approvedAt", "approvedBy", "city", "companyName", "contactName", "contactPhone", "country", "createdAt", "email", "id", "lastLoginAt", "password", "postalCode", "region", "status", "street", "updatedAt", "vatNumber", "viesValidated", "viesValidatedAt" FROM "B2BCustomer";
DROP TABLE "B2BCustomer";
ALTER TABLE "new_B2BCustomer" RENAME TO "B2BCustomer";
CREATE UNIQUE INDEX "B2BCustomer_email_key" ON "B2BCustomer"("email");
CREATE UNIQUE INDEX "B2BCustomer_vatNumber_key" ON "B2BCustomer"("vatNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
