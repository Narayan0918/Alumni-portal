CREATE DATABASE alumni_db;

-- 1. Users Table (Authentication)
CREATE TABLE users (
    user_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'alumni' CHECK (role IN ('alumni', 'admin', 'student')),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Alumni Profiles (The Data)
CREATE TABLE alumni_profiles (
    profile_id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(user_id) ON DELETE CASCADE,
    full_name VARCHAR(100) NOT NULL,
    graduation_year INT,
    degree VARCHAR(100),
    major VARCHAR(100),
    current_company VARCHAR(100),
    job_title VARCHAR(100),
    is_mentor BOOLEAN DEFAULT FALSE
);

-- Indexing for fast search (Best Practice)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_profiles_grad_year ON alumni_profiles(graduation_year);