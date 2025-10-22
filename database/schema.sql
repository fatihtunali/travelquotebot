-- Organizations/Tour Operators Table (Main Tenant)
CREATE TABLE organizations (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50),
  country VARCHAR(100),
  status ENUM('active', 'inactive', 'suspended') DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- White Label Settings
CREATE TABLE white_label_settings (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  custom_domain VARCHAR(255),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7),
  secondary_color VARCHAR(7),
  company_name VARCHAR(255),
  support_email VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY (organization_id)
);

-- Users Table (Tour Operator Staff/Admins)
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT,
  email VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  role ENUM('super_admin', 'org_admin', 'org_user') DEFAULT 'org_user',
  status ENUM('active', 'inactive') DEFAULT 'active',
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY unique_email_per_org (email, organization_id)
);

-- Credits/Usage Table (Per Organization)
CREATE TABLE organization_credits (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  credits_total INT DEFAULT 0,
  credits_used INT DEFAULT 0,
  credits_available INT GENERATED ALWAYS AS (credits_total - credits_used) STORED,
  reset_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  UNIQUE KEY (organization_id)
);

-- Subscriptions Table (Per Organization)
CREATE TABLE subscriptions (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  plan_type ENUM('starter', 'professional', 'enterprise') NOT NULL,
  monthly_credits INT NOT NULL,
  price DECIMAL(10,2),
  status ENUM('active', 'trial', 'expired', 'cancelled') DEFAULT 'trial',
  trial_ends_at TIMESTAMP NULL,
  current_period_start TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  current_period_end TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Quotes Table
CREATE TABLE quotes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT NOT NULL,
  created_by_user_id INT,
  quote_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255),
  customer_email VARCHAR(255),
  destination VARCHAR(255),
  start_date DATE,
  end_date DATE,
  adults INT DEFAULT 1,
  children INT DEFAULT 0,
  total_price DECIMAL(10,2),
  status ENUM('draft', 'sent', 'accepted', 'rejected', 'expired') DEFAULT 'draft',
  itinerary JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (created_by_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Activity Logs
CREATE TABLE activity_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  organization_id INT,
  user_id INT,
  action VARCHAR(255) NOT NULL,
  resource_type VARCHAR(50),
  resource_id INT,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Indexes
CREATE INDEX idx_orgs_slug ON organizations(slug);
CREATE INDEX idx_orgs_status ON organizations(status);
CREATE INDEX idx_users_org ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_quotes_org ON quotes(organization_id);
CREATE INDEX idx_quotes_status ON quotes(status);
CREATE INDEX idx_activity_org ON activity_logs(organization_id);
