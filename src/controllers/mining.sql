-- Users (tambahkan kolom vip_level jika belum ada)
ALTER TABLE users ADD COLUMN vip_level INT DEFAULT 0;

-- Tabel investasi/mining
CREATE TABLE mining_investments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  amount BIGINT,
  cashback BIGINT DEFAULT 0,
  start_time DATETIME,
  end_time DATETIME,
  last_profit_time DATETIME,
  total_profit BIGINT DEFAULT 0,
  status ENUM('active','completed') DEFAULT 'active'
);

-- History profit per jam
CREATE TABLE mining_profits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  investment_id INT,
  user_id INT,
  profit BIGINT,
  profit_time DATETIME
);

-- Referral
CREATE TABLE user_referrals (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  ref_by INT
);

-- Bonus referral
CREATE TABLE mining_referral_bonus (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  from_user_id INT,
  investment_id INT,
  bonus BIGINT,
  bonus_time DATETIME
);