
CREATE TABLE IF NOT EXISTS t_p50704210_electronics_store_ap.users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  phone VARCHAR(20),
  role VARCHAR(20) DEFAULT 'customer',
  avatar_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p50704210_electronics_store_ap.products (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  brand VARCHAR(100),
  category VARCHAR(100),
  price NUMERIC(12,2) NOT NULL,
  old_price NUMERIC(12,2),
  rating NUMERIC(3,2) DEFAULT 0,
  reviews_count INTEGER DEFAULT 0,
  power_info VARCHAR(100),
  warranty VARCHAR(50),
  badge VARCHAR(50),
  description TEXT,
  img_url TEXT,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p50704210_electronics_store_ap.orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p50704210_electronics_store_ap.users(id),
  status VARCHAR(50) DEFAULT 'processing',
  total NUMERIC(12,2),
  delivery_address TEXT,
  delivery_method VARCHAR(50) DEFAULT 'courier',
  payment_method VARCHAR(50) DEFAULT 'card',
  comment TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS t_p50704210_electronics_store_ap.order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES t_p50704210_electronics_store_ap.orders(id),
  product_id INTEGER REFERENCES t_p50704210_electronics_store_ap.products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  price NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS t_p50704210_electronics_store_ap.sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES t_p50704210_electronics_store_ap.users(id),
  token VARCHAR(255) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
