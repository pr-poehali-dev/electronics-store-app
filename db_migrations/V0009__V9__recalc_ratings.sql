
UPDATE t_p50704210_electronics_store_ap.products p
SET
  rating = COALESCE((SELECT ROUND(AVG(r.rating)::numeric, 2) FROM t_p50704210_electronics_store_ap.reviews r WHERE r.product_id = p.id), p.rating),
  reviews_count = (SELECT COUNT(*) FROM t_p50704210_electronics_store_ap.reviews r WHERE r.product_id = p.id) + p.reviews_count
WHERE EXISTS (SELECT 1 FROM t_p50704210_electronics_store_ap.reviews r WHERE r.product_id = p.id);
