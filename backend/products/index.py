"""
Управление товарами и отзывами.
GET /?id=N - детали товара
GET / - список с фильтрами
POST / - создать товар
PUT / - обновить товар
DELETE /?id=N - скрыть товар

GET /?section=reviews&product_id=N - отзывы к товару
POST /?section=reviews - добавить отзыв
DELETE /?section=reviews&id=N - удалить отзыв (admin)
"""
import json
import os
import psycopg2

SCHEMA = "t_p50704210_electronics_store_ap"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, Authorization",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def get_user_from_token(cur, token):
    if not token:
        return None
    cur.execute(f"""
        SELECT u.id, u.first_name, u.last_name, u.role FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    headers = event.get("headers") or {}
    section = params.get("section", "products")

    auth = headers.get("X-Authorization") or headers.get("Authorization") or ""
    token = auth[7:] if auth.startswith("Bearer ") else headers.get("X-Auth-Token", "")

    conn = get_conn()
    cur = conn.cursor()

    try:
        # ============ REVIEWS ============
        if section == "reviews":
            if method == "GET":
                product_id = params.get("product_id")
                if not product_id:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "product_id required"})}

                cur.execute(f"""
                    SELECT r.id, r.author_name, r.rating, r.text, r.is_verified, r.created_at, r.user_id
                    FROM {SCHEMA}.reviews r
                    WHERE r.product_id = %s
                    ORDER BY r.created_at DESC
                """, (int(product_id),))
                rows = cur.fetchall()
                reviews = [{
                    "id": r[0], "author_name": r[1], "rating": r[2], "text": r[3],
                    "is_verified": r[4], "created_at": str(r[5]), "user_id": r[6]
                } for r in rows]

                # Stats
                cur.execute(f"""
                    SELECT AVG(rating), COUNT(*),
                           SUM(CASE WHEN rating=5 THEN 1 ELSE 0 END),
                           SUM(CASE WHEN rating=4 THEN 1 ELSE 0 END),
                           SUM(CASE WHEN rating=3 THEN 1 ELSE 0 END),
                           SUM(CASE WHEN rating=2 THEN 1 ELSE 0 END),
                           SUM(CASE WHEN rating=1 THEN 1 ELSE 0 END)
                    FROM {SCHEMA}.reviews WHERE product_id = %s
                """, (int(product_id),))
                st = cur.fetchone()
                stats = {
                    "avg": round(float(st[0]), 1) if st[0] else 0,
                    "count": int(st[1]),
                    "by_rating": {5: int(st[2] or 0), 4: int(st[3] or 0), 3: int(st[4] or 0), 2: int(st[5] or 0), 1: int(st[6] or 0)}
                }
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"reviews": reviews, "stats": stats})}

            elif method == "POST":
                body = json.loads(event.get("body") or "{}")
                product_id = body.get("product_id")
                rating = body.get("rating")
                text = body.get("text", "").strip()
                author_name = body.get("author_name", "Аноним")

                if not product_id or not rating:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "product_id and rating required"})}
                if int(rating) < 1 or int(rating) > 5:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "rating must be 1-5"})}

                user_row = get_user_from_token(cur, token)
                user_id = user_row[0] if user_row else None
                is_verified = user_id is not None

                if user_row and not author_name.strip():
                    author_name = f"{user_row[1] or ''} {user_row[2] or ''}".strip() or "Покупатель"

                # Проверка: не более одного отзыва от пользователя
                if user_id:
                    cur.execute(f"SELECT id FROM {SCHEMA}.reviews WHERE product_id=%s AND user_id=%s", (int(product_id), user_id))
                    if cur.fetchone():
                        return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "already reviewed"})}

                cur.execute(f"""
                    INSERT INTO {SCHEMA}.reviews (product_id, user_id, author_name, rating, text, is_verified)
                    VALUES (%s, %s, %s, %s, %s, %s) RETURNING id
                """, (int(product_id), user_id, author_name, int(rating), text, is_verified))
                new_id = cur.fetchone()[0]

                # Обновляем рейтинг товара
                cur.execute(f"""
                    UPDATE {SCHEMA}.products SET
                        rating = (SELECT AVG(rating) FROM {SCHEMA}.reviews WHERE product_id = %s),
                        reviews_count = (SELECT COUNT(*) FROM {SCHEMA}.reviews WHERE product_id = %s),
                        updated_at = NOW()
                    WHERE id = %s
                """, (int(product_id), int(product_id), int(product_id)))
                conn.commit()

                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id, "message": "created"})}

            elif method == "DELETE":
                review_id = params.get("id")
                if not review_id:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}

                cur.execute(f"SELECT product_id FROM {SCHEMA}.reviews WHERE id=%s", (int(review_id),))
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
                product_id = row[0]

                cur.execute(f"DELETE FROM {SCHEMA}.reviews WHERE id=%s", (int(review_id),))
                # Пересчитываем рейтинг
                cur.execute(f"""
                    UPDATE {SCHEMA}.products SET
                        rating = COALESCE((SELECT AVG(rating) FROM {SCHEMA}.reviews WHERE product_id = %s), 0),
                        reviews_count = (SELECT COUNT(*) FROM {SCHEMA}.reviews WHERE product_id = %s),
                        updated_at = NOW()
                    WHERE id = %s
                """, (product_id, product_id, product_id))
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"message": "deleted"})}

        # ============ PRODUCTS ============
        else:
            if method == "GET":
                # Метаданные для фильтров
                if params.get("meta") == "true":
                    cat_filter = params.get("category", "")
                    meta_cond = "is_active = TRUE"
                    meta_args = []
                    if cat_filter:
                        meta_cond += " AND category = %s"
                        meta_args.append(cat_filter)
                    cur.execute(f"SELECT DISTINCT brand FROM {SCHEMA}.products WHERE {meta_cond} ORDER BY brand", meta_args)
                    brands = [r[0] for r in cur.fetchall()]
                    cur.execute(f"SELECT MIN(price), MAX(price) FROM {SCHEMA}.products WHERE {meta_cond}", meta_args)
                    row = cur.fetchone()
                    return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                        "brands": brands,
                        "price_min": float(row[0]) if row[0] else 0,
                        "price_max": float(row[1]) if row[1] else 999999,
                    })}

                product_id = params.get("id")
                if product_id:
                    cur.execute(f"SELECT * FROM {SCHEMA}.products WHERE id = %s", (int(product_id),))
                    row = cur.fetchone()
                    if not row:
                        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
                    cols = [d[0] for d in cur.description]
                    product = dict(zip(cols, row))
                    product["price"] = float(product["price"]) if product["price"] else None
                    product["old_price"] = float(product["old_price"]) if product["old_price"] else None
                    product["rating"] = float(product["rating"]) if product["rating"] else 0
                    product["created_at"] = str(product["created_at"])
                    product["updated_at"] = str(product["updated_at"])
                    return {"statusCode": 200, "headers": CORS, "body": json.dumps(product)}

                category = params.get("category", "")
                brand = params.get("brand", "")
                search = params.get("search", "")
                sort_by = params.get("sort_by", "reviews_count")
                page = int(params.get("page", 1))
                per_page = int(params.get("per_page", 20))
                offset = (page - 1) * per_page
                min_price = params.get("min_price", "")
                max_price = params.get("max_price", "")
                min_rating = params.get("min_rating", "")
                in_stock = params.get("in_stock", "")
                has_discount = params.get("has_discount", "")
                # brands — несколько через запятую
                brands_raw = params.get("brands", "")

                conditions = ["is_active = TRUE"]
                args = []
                if category:
                    conditions.append("category = %s")
                    args.append(category)
                if brand:
                    conditions.append("brand = %s")
                    args.append(brand)
                if brands_raw:
                    brand_list = [b.strip() for b in brands_raw.split(",") if b.strip()]
                    if brand_list:
                        placeholders = ",".join(["%s"] * len(brand_list))
                        conditions.append(f"brand IN ({placeholders})")
                        args.extend(brand_list)
                if search:
                    conditions.append("name ILIKE %s")
                    args.append(f"%{search}%")
                if min_price:
                    conditions.append("price >= %s")
                    args.append(float(min_price))
                if max_price:
                    conditions.append("price <= %s")
                    args.append(float(max_price))
                if min_rating:
                    conditions.append("rating >= %s")
                    args.append(float(min_rating))
                if in_stock == "true":
                    conditions.append("stock > 0")
                if has_discount == "true":
                    conditions.append("old_price IS NOT NULL AND old_price > price")

                where = " AND ".join(conditions)
                order_map = {
                    "reviews_count": "reviews_count DESC",
                    "price_asc": "price ASC",
                    "price_desc": "price DESC",
                    "rating": "rating DESC",
                    "created_at": "created_at DESC"
                }
                order = order_map.get(sort_by, "reviews_count DESC")

                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.products WHERE {where}", args)
                total = cur.fetchone()[0]

                cur.execute(f"SELECT * FROM {SCHEMA}.products WHERE {where} ORDER BY {order} LIMIT %s OFFSET %s", args + [per_page, offset])
                rows = cur.fetchall()
                cols = [d[0] for d in cur.description]
                products = []
                for row in rows:
                    p = dict(zip(cols, row))
                    p["price"] = float(p["price"]) if p["price"] else None
                    p["old_price"] = float(p["old_price"]) if p["old_price"] else None
                    p["rating"] = float(p["rating"]) if p["rating"] else 0
                    p["created_at"] = str(p["created_at"])
                    p["updated_at"] = str(p["updated_at"])
                    products.append(p)

                return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                    "products": products, "total": total, "page": page,
                    "per_page": per_page, "pages": (total + per_page - 1) // per_page
                })}

            elif method == "POST":
                body = json.loads(event.get("body") or "{}")
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.products (name, brand, category, price, old_price, rating, reviews_count, power_info, warranty, badge, description, img_url, stock, is_active)
                    VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s) RETURNING id
                """, (
                    body.get("name"), body.get("brand"), body.get("category"),
                    body.get("price"), body.get("old_price"), body.get("rating", 0),
                    body.get("reviews_count", 0), body.get("power_info"), body.get("warranty"),
                    body.get("badge"), body.get("description"), body.get("img_url"),
                    body.get("stock", 0), body.get("is_active", True)
                ))
                new_id = cur.fetchone()[0]
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"id": new_id, "message": "created"})}

            elif method == "PUT":
                body = json.loads(event.get("body") or "{}")
                pid = body.get("id")
                if not pid:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
                cur.execute(f"""
                    UPDATE {SCHEMA}.products SET
                      name=%s, brand=%s, category=%s, price=%s, old_price=%s,
                      rating=%s, reviews_count=%s, power_info=%s, warranty=%s,
                      badge=%s, description=%s, img_url=%s, stock=%s, is_active=%s, updated_at=NOW()
                    WHERE id=%s
                """, (
                    body.get("name"), body.get("brand"), body.get("category"),
                    body.get("price"), body.get("old_price"), body.get("rating"),
                    body.get("reviews_count"), body.get("power_info"), body.get("warranty"),
                    body.get("badge"), body.get("description"), body.get("img_url"),
                    body.get("stock"), body.get("is_active"), pid
                ))
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"message": "updated"})}

            elif method == "DELETE":
                pid = params.get("id")
                if not pid:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
                cur.execute(f"UPDATE {SCHEMA}.products SET is_active=FALSE WHERE id=%s", (int(pid),))
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"message": "deleted"})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 405, "headers": CORS, "body": json.dumps({"error": "method not allowed"})}