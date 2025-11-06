-- SQL Script to create notifications and device tokens tables
-- Run this script in your MySQL database to enable notifications functionality

-- Table: Customer_Notifications
-- Stores all notifications for customers
CREATE TABLE IF NOT EXISTS Customer_Notifications (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'system',
    priority VARCHAR(20) DEFAULT 'medium',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_customer_id (customer_id),
    INDEX idx_created_at (created_at),
    INDEX idx_is_read (is_read),
    FOREIGN KEY (customer_id) REFERENCES b2c_customer_master(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table: b2c_device_tokens
-- Stores FCM device tokens for push notifications
CREATE TABLE IF NOT EXISTS b2c_device_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id VARCHAR(50) NOT NULL,
    device_token TEXT NOT NULL,
    platform VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_customer_device (customer_id, device_token(255)),
    INDEX idx_customer_id (customer_id),
    INDEX idx_platform (platform),
    FOREIGN KEY (customer_id) REFERENCES b2c_customer_master(customer_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Sample notification for testing (uncomment to insert)
-- INSERT INTO Customer_Notifications (customer_id, title, message, type, priority) 
-- VALUES ('1001', 'Welcome!', 'Your account has been approved. Welcome to One Step Greener!', 'system', 'high');

