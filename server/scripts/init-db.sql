-- NXvms Database Initialization Script
-- This script runs automatically when PostgreSQL container starts

-- Note: The main database (nxvms_db) is created by POSTGRES_DB environment variable
-- This file can contain additional initialization logic if needed

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
