-- Create Database
CREATE DATABASE IF NOT EXISTS casdic_db;
USE casdic_db;

-- 1. Technologies Table (already exists, keep if created before)
CREATE TABLE IF NOT EXISTS technologies (
  tech_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  category VARCHAR(100),
  production_start_date DATE,
  last_usage_date DATE NULL,
  status ENUM("In Development","In Use","Deprecated"),
  trl_start TINYINT,
  trl_achieved TINYINT,
  trl_description TEXT,
  budget DECIMAL(15,2),
  security_level ENUM("Public","Restricted","Confidential","Top Secret"),
  location VARCHAR(255),
  tech_stack TEXT,
  salient_features TEXT,
  achievements TEXT,
  image_path VARCHAR(255),
  dev_proj_name VARCHAR(255),
  dev_proj_number VARCHAR(100),
  dev_proj_code VARCHAR(100),
  funding_details TEXT
);

-- 2. Technology Specs
CREATE TABLE IF NOT EXISTS technology_specs (
  spec_id INT AUTO_INCREMENT PRIMARY KEY,
  tech_id INT,
  parameter_name VARCHAR(255),
  parameter_value VARCHAR(255),
  unit VARCHAR(50),
  configurable BOOLEAN,
  FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);

-- 3. Qualification Hardware
CREATE TABLE IF NOT EXISTS qualification_hw (
  hw_id INT AUTO_INCREMENT PRIMARY KEY,
  tech_id INT,
  requirement TEXT,
  achieved_status VARCHAR(255),
  date_achieved DATE,
  FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);

-- 4. Qualification Software
CREATE TABLE IF NOT EXISTS qualification_sw (
  sw_id INT AUTO_INCREMENT PRIMARY KEY,
  tech_id INT,
  requirement TEXT,
  achieved_status VARCHAR(255),
  date_achieved DATE,
  FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);

-- 5. Versions
CREATE TABLE IF NOT EXISTS versions (
  version_id INT AUTO_INCREMENT PRIMARY KEY,
  tech_id INT,
  version_number VARCHAR(50),
  release_date DATE,
  notes TEXT,
  FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);

-- 6. Companies
CREATE TABLE IF NOT EXISTS companies (
  company_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  country VARCHAR(100),
  role VARCHAR(100)
);

-- 7. Projects
CREATE TABLE IF NOT EXISTS projects (
  project_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  description TEXT,
  start_date DATE,
  end_date DATE NULL
);

-- 8. Employees
CREATE TABLE IF NOT EXISTS employees (
  employee_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  designation VARCHAR(100),
  department VARCHAR(100),
  email VARCHAR(255)
);

-- 9. Patents
CREATE TABLE IF NOT EXISTS patents (
  patent_id INT AUTO_INCREMENT PRIMARY KEY,
  tech_id INT,
  title VARCHAR(255),
  patent_number VARCHAR(100),
  date_filed DATE,
  date_granted DATE,
  FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);

-- 10. Publications
CREATE TABLE IF NOT EXISTS publications (
  pub_id INT AUTO_INCREMENT PRIMARY KEY,
  tech_id INT,
  title VARCHAR(255),
  authors TEXT,
  journal VARCHAR(255),
  year YEAR,
  link VARCHAR(255),
  FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);
 -- 11. Users
 CREATE TABLE IF NOT EXISTS users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) UNIQUE,
  password VARCHAR(255),
  role ENUM("user","employee") DEFAULT "user"
);
-- 12. Watchlist (tech "wishlist" / thunder feature)
CREATE TABLE watchlist (
  watch_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  item_type ENUM('tech','project','patent','pub'),
  item_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


-- 13. Notifications (updates related to watched tech)
CREATE TABLE IF NOT EXISTS notifications (
  notification_id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  tech_id INT,
  message TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_read BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
  FOREIGN KEY (tech_id) REFERENCES technologies(tech_id) ON DELETE CASCADE
);
