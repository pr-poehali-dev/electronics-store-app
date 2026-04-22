
CREATE TABLE IF NOT EXISTS t_p50704210_electronics_store_ap.reviews (
  id SERIAL PRIMARY KEY,
  product_id INTEGER NOT NULL REFERENCES t_p50704210_electronics_store_ap.products(id),
  user_id INTEGER REFERENCES t_p50704210_electronics_store_ap.users(id),
  author_name VARCHAR(100) NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text TEXT,
  is_verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_reviews_product ON t_p50704210_electronics_store_ap.reviews(product_id);
