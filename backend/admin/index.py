"""
Административная функция: управление клиентами и аналитика.
GET /?section=customers - список клиентов
GET /?section=customers&id=N - детали клиента
PUT /?section=customers - обновить клиента
GET /?section=analytics&type=overview|revenue|products|categories|statuses
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
    section = params.get("section", "analytics")
    conn = get_conn()
    cur = conn.cursor()

    try:
        # ---- CUSTOMERS ----
        if section == "customers":
            if method == "GET":
                customer_id = params.get("id")
                if customer_id:
                    cur.execute(f"""
                        SELECT id, email, first_name, last_name, phone, role, created_at
                        FROM {SCHEMA}.users WHERE id = %s
                    """, (int(customer_id),))
                    row = cur.fetchone()
                    if not row:
                        return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
                    user = {"id": row[0], "email": row[1], "first_name": row[2], "last_name": row[3],
                            "phone": row[4], "role": row[5], "created_at": str(row[6])}
                    cur.execute(f"""
                        SELECT id, status, total, created_at FROM {SCHEMA}.orders
                        WHERE user_id = %s ORDER BY created_at DESC LIMIT 10
                    """, (int(customer_id),))
                    user["orders"] = [{"id": r[0], "status": r[1], "total": float(r[2]) if r[2] else 0,
                                       "created_at": str(r[3])} for r in cur.fetchall()]
                    cur.execute(f"SELECT COUNT(*), COALESCE(SUM(total),0) FROM {SCHEMA}.orders WHERE user_id = %s",
                                (int(customer_id),))
                    cnt, spent = cur.fetchone()
                    user["orders_count"] = cnt
                    user["total_spent"] = float(spent)
                    return {"statusCode": 200, "headers": CORS, "body": json.dumps(user)}

                search = params.get("search", "")
                page = int(params.get("page", 1))
                per_page = int(params.get("per_page", 20))
                offset = (page - 1) * per_page
                conditions = ["1=1"]
                args = []
                if search:
                    conditions.append("(email ILIKE %s OR first_name ILIKE %s OR last_name ILIKE %s)")
                    args.extend([f"%{search}%", f"%{search}%", f"%{search}%"])
                where = " AND ".join(conditions)
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users WHERE {where}", args)
                total = cur.fetchone()[0]
                cur.execute(f"""
                    SELECT u.id, u.email, u.first_name, u.last_name, u.phone, u.role, u.created_at,
                           COUNT(o.id) as orders_count, COALESCE(SUM(o.total),0) as total_spent
                    FROM {SCHEMA}.users u
                    LEFT JOIN {SCHEMA}.orders o ON o.user_id = u.id
                    WHERE {where}
                    GROUP BY u.id ORDER BY u.created_at DESC LIMIT %s OFFSET %s
                """, args + [per_page, offset])
                rows = cur.fetchall()
                customers = [{"id": r[0], "email": r[1], "first_name": r[2], "last_name": r[3],
                              "phone": r[4], "role": r[5], "created_at": str(r[6]),
                              "orders_count": int(r[7]), "total_spent": float(r[8])} for r in rows]
                return {"statusCode": 200, "headers": CORS, "body": json.dumps(
                    {"customers": customers, "total": total, "page": page, "per_page": per_page})}

            elif method == "PUT":
                body = json.loads(event.get("body") or "{}")
                uid = body.get("id")
                role = body.get("role")
                if not uid:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id required"})}
                if role:
                    cur.execute(f"UPDATE {SCHEMA}.users SET role=%s WHERE id=%s", (role, uid))
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"message": "updated"})}

        # ---- ANALYTICS ----
        elif section == "analytics":
            report_type = params.get("type", "overview")

            if report_type == "overview":
                cur.execute(f"SELECT COUNT(*), COALESCE(SUM(total),0) FROM {SCHEMA}.orders")
                orders_count, revenue_total = cur.fetchone()
                cur.execute(f"SELECT COUNT(*), COALESCE(SUM(total),0) FROM {SCHEMA}.orders WHERE created_at >= NOW() - INTERVAL '30 days'")
                orders_30, revenue_30 = cur.fetchone()
                cur.execute(f"SELECT COUNT(*), COALESCE(SUM(total),0) FROM {SCHEMA}.orders WHERE created_at >= NOW() - INTERVAL '60 days' AND created_at < NOW() - INTERVAL '30 days'")
                orders_prev, revenue_prev = cur.fetchone()
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users")
                users_total = cur.fetchone()[0]
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.users WHERE created_at >= NOW() - INTERVAL '30 days'")
                users_new = cur.fetchone()[0]
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.products WHERE is_active=TRUE")
                products_count = cur.fetchone()[0]
                cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.products WHERE stock < 10 AND is_active=TRUE")
                low_stock = cur.fetchone()[0]
                orders_delta = round(((float(orders_30) - float(orders_prev)) / max(float(orders_prev), 1)) * 100, 1)
                revenue_delta = round(((float(revenue_30) - float(revenue_prev)) / max(float(revenue_prev), 1)) * 100, 1)
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                    "orders_total": int(orders_count), "revenue_total": float(revenue_total),
                    "orders_30": int(orders_30), "revenue_30": float(revenue_30),
                    "orders_delta": orders_delta, "revenue_delta": revenue_delta,
                    "users_total": int(users_total), "users_new": int(users_new),
                    "products_count": int(products_count), "low_stock": int(low_stock),
                })}

            elif report_type == "revenue":
                period = int(params.get("period", 30))
                cur.execute(f"""
                    SELECT DATE(created_at) as day, COUNT(*) as cnt, COALESCE(SUM(total),0) as rev
                    FROM {SCHEMA}.orders WHERE created_at >= NOW() - INTERVAL '{period} days'
                    GROUP BY DATE(created_at) ORDER BY day
                """)
                data = [{"date": str(r[0]), "orders": int(r[1]), "revenue": float(r[2])} for r in cur.fetchall()]
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"data": data})}

            elif report_type == "products":
                cur.execute(f"""
                    SELECT p.id, p.name, p.brand, p.category, p.price, p.stock,
                           COUNT(oi.id) as sold_count, COALESCE(SUM(oi.quantity),0) as units_sold
                    FROM {SCHEMA}.products p
                    LEFT JOIN {SCHEMA}.order_items oi ON oi.product_id = p.id
                    WHERE p.is_active = TRUE
                    GROUP BY p.id ORDER BY units_sold DESC LIMIT 10
                """)
                rows = cur.fetchall()
                products = [{"id": r[0], "name": r[1], "brand": r[2], "category": r[3],
                             "price": float(r[4]), "stock": r[5], "sold_count": int(r[6]),
                             "units_sold": int(r[7])} for r in rows]
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"products": products})}

            elif report_type == "categories":
                cur.execute(f"""
                    SELECT p.category, COUNT(p.id) as count, COALESCE(AVG(p.price),0) as avg_price,
                           COALESCE(SUM(p.stock),0) as total_stock
                    FROM {SCHEMA}.products p WHERE p.is_active=TRUE
                    GROUP BY p.category ORDER BY count DESC
                """)
                cats = [{"category": r[0], "count": int(r[1]), "avg_price": round(float(r[2]), 2),
                         "total_stock": int(r[3])} for r in cur.fetchall()]
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"categories": cats})}

            elif report_type == "statuses":
                cur.execute(f"SELECT status, COUNT(*) FROM {SCHEMA}.orders GROUP BY status")
                data = {r[0]: int(r[1]) for r in cur.fetchall()}
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"statuses": data})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "unknown section or type"})}
