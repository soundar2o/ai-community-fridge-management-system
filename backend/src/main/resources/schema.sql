-- Digital Community Fridge Management System Schema DDL

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Community Fridges Table
CREATE TABLE IF NOT EXISTS community_fridges (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    latitude DOUBLE,
    longitude DOUBLE,
    capacity_kg DOUBLE NOT NULL,
    current_occupancy_kg DOUBLE DEFAULT 0.0,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    managed_by_user_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (managed_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 3. Food Donations Table
CREATE TABLE IF NOT EXISTS food_donations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donor_id BIGINT NOT NULL,
    fridge_id BIGINT NOT NULL,
    food_name VARCHAR(150) NOT NULL,
    category VARCHAR(50),
    quantity INT NOT NULL,
    unit VARCHAR(20) DEFAULT 'items',
    image_url VARCHAR(255),
    expiry_datetime DATETIME NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING_VERIFICATION',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (donor_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (fridge_id) REFERENCES community_fridges(id) ON DELETE CASCADE
);

-- 4. Donation History Table
CREATE TABLE IF NOT EXISTS donation_history (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    food_donation_id BIGINT NOT NULL,
    action_by_user_id BIGINT NOT NULL,
    action VARCHAR(100) NOT NULL,
    notes TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (food_donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
    FOREIGN KEY (action_by_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Food Requests Table
CREATE TABLE IF NOT EXISTS food_requests (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    donation_id BIGINT NOT NULL,
    receiver_id BIGINT NOT NULL,
    requested_quantity INT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (donation_id) REFERENCES food_donations(id) ON DELETE CASCADE,
    FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Notifications Table
CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
