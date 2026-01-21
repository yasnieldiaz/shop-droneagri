-- CreateTable
CREATE TABLE "B2BCustomer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "companyName" TEXT NOT NULL,
    "vatNumber" TEXT NOT NULL,
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

-- CreateTable
CREATE TABLE "B2BPrice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "pricePL" INTEGER NOT NULL,
    "priceEU" INTEGER NOT NULL,
    "discountPL" REAL,
    "discountEU" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "B2BOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderNumber" TEXT NOT NULL,
    "b2bCustomerId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentMethod" TEXT,
    "subtotal" INTEGER NOT NULL,
    "shippingCost" INTEGER NOT NULL DEFAULT 0,
    "tax" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PLN',
    "reverseCharge" BOOLEAN NOT NULL DEFAULT false,
    "customerNote" TEXT,
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "paidAt" DATETIME,
    "shippedAt" DATETIME,
    CONSTRAINT "B2BOrder_b2bCustomerId_fkey" FOREIGN KEY ("b2bCustomerId") REFERENCES "B2BCustomer" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "B2BOrderItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productImage" TEXT,
    "quantity" INTEGER NOT NULL,
    "unitPrice" INTEGER NOT NULL,
    "totalPrice" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "B2BOrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "B2BOrder" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "B2BCustomer_email_key" ON "B2BCustomer"("email");

-- CreateIndex
CREATE UNIQUE INDEX "B2BCustomer_vatNumber_key" ON "B2BCustomer"("vatNumber");

-- CreateIndex
CREATE UNIQUE INDEX "B2BPrice_productId_key" ON "B2BPrice"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "B2BOrder_orderNumber_key" ON "B2BOrder"("orderNumber");
