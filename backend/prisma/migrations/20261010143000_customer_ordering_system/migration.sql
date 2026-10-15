-- Link registered customer accounts to the existing customer records.
ALTER TABLE `Customer`
    MODIFY `address` TEXT NULL;

ALTER TABLE `Customer`
    ADD COLUMN `userId` INTEGER NULL,
    ADD UNIQUE INDEX `Customer_userId_key`(`userId`);

ALTER TABLE `Customer`
    ADD CONSTRAINT `Customer_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `User`(`id`)
    ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `Order` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `customerId` INTEGER NOT NULL,
    `saleId` INTEGER NULL,
    `phone` VARCHAR(40) NOT NULL,
    `deliveryAddress` TEXT NOT NULL,
    `notes` TEXT NULL,
    `status` ENUM('pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled') NOT NULL DEFAULT 'pending',
    `totalAmount` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Order_saleId_key`(`saleId`),
    INDEX `Order_customerId_createdAt_idx`(`customerId`, `createdAt`),
    INDEX `Order_status_createdAt_idx`(`status`, `createdAt`),
    PRIMARY KEY (`id`),
    CONSTRAINT `Order_customerId_fkey`
      FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`)
      ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT `Order_saleId_fkey`
      FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`)
      ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `OrderItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `productId` INTEGER NOT NULL,
    `productName` VARCHAR(191) NOT NULL,
    `unit` VARCHAR(191) NOT NULL,
    `quantity` DECIMAL(10, 2) NOT NULL,
    `unitPrice` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    INDEX `OrderItem_orderId_idx`(`orderId`),
    PRIMARY KEY (`id`),
    CONSTRAINT `OrderItem_orderId_fkey`
      FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`)
      ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `OrderItem_productId_fkey`
      FOREIGN KEY (`productId`) REFERENCES `Product`(`id`)
      ON DELETE RESTRICT ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
