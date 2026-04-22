"""
Управление товарами: список, детали, создание, обновление, удаление.
GET / - список с фильтрами и пагинацией
GET /?id=N - детали товара
POST / - создать товар (admin)
PUT / - обновить товар (admin)
DELETE /?id=N - удалить товар (admin)
"""
import json
import os
import psycopg2

SCHEMA = "t_p50704210_electronics_store_ap"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    headers = event.get("headers") or {}

    conn = get_conn()
    cur = conn.cursor()

    try:
        if method == "GET":
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

            conditions = ["is_active = TRUE"]
            args = []
            if category:
                conditions.append("category = %s")
                args.append(category)
            if brand:
                conditions.append("brand = %s")
                args.append(brand)
            if search:
                conditions.append("name ILIKE %s")
                args.append(f"%{search}%")

            where = " AND ".join(conditions)
            order_map = {
                "reviews_count": "reviews_count DESC",
                "price_asc": "price ASC",
                "price_desc": "price DESC",
                "rating": "rating DESC",
                "created_at": "created_at DESC"
            }
            order = order_map.get(sort_by, "reviews_count DESC")

            count_sql = f"SELECT COUNT(*) FROM {SCHEMA}.products WHERE {where}"
            cur.execute(count_sql, args)
            total = cur.fetchone()[0]

            sql = f"SELECT * FROM {SCHEMA}.products WHERE {where} ORDER BY {order} LIMIT %s OFFSET %s"
            cur.execute(sql, args + [per_page, offset])
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
                "products": products,
                "total": total,
                "page": page,
                "per_page": per_page,
                "pages": (total + per_page - 1) // per_page
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
