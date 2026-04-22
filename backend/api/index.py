"""
Универсальная API функция: авторизация + заказы.
Маршрутизация по параметру ?section=auth|orders

AUTH:
POST /?section=auth&action=register
POST /?section=auth&action=login
POST /?section=auth&action=logout
GET  /?section=auth&action=me

ORDERS:
GET  /?section=orders - мои заказы (с токеном) или все (с all=true)
POST /?section=orders - создать заказ
PUT  /?section=orders - обновить статус
"""
import json
import os
import hashlib
import secrets
from datetime import datetime, timedelta
import psycopg2

SCHEMA = "t_p50704210_electronics_store_ap"
CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-User-Id, X-Auth-Token, X-Session-Id, Authorization",
}


def get_conn():
    return psycopg2.connect(os.environ["DATABASE_URL"])


def hash_password(pwd: str) -> str:
    return hashlib.sha256(pwd.encode()).hexdigest()


def get_token(event: dict) -> str:
    headers = event.get("headers") or {}
    auth = headers.get("X-Authorization") or headers.get("Authorization") or ""
    if auth.startswith("Bearer "):
        return auth[7:]
    return headers.get("X-Auth-Token", "")


def get_user_from_token(cur, token):
    if not token:
        return None
    cur.execute(f"""
        SELECT u.id, u.role, u.email, u.first_name, u.last_name FROM {SCHEMA}.sessions s
        JOIN {SCHEMA}.users u ON u.id = s.user_id
        WHERE s.token = %s AND s.expires_at > NOW()
    """, (token,))
    return cur.fetchone()


def handler(event: dict, context) -> dict:
    if event.get("httpMethod") == "OPTIONS":
        return {"statusCode": 200, "headers": CORS, "body": ""}

    method = event.get("httpMethod", "GET")
    params = event.get("queryStringParameters") or {}
    section = params.get("section", "auth")
    action = params.get("action", "")
    body = json.loads(event.get("body") or "{}")
    conn = get_conn()
    cur = conn.cursor()

    try:
        # ============ AUTH ============
        if section == "auth":
            if method == "GET" and action == "me":
                token = get_token(event)
                user = get_user_from_token(cur, token)
                if not user:
                    return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                    "user": {"id": user[0], "role": user[1], "email": user[2],
                             "first_name": user[3], "last_name": user[4]}
                })}

            if method == "POST" and action == "register":
                email = body.get("email", "").strip().lower()
                password = body.get("password", "")
                if not email or not password:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "email and password required"})}
                cur.execute(f"SELECT id FROM {SCHEMA}.users WHERE email=%s", (email,))
                if cur.fetchone():
                    return {"statusCode": 409, "headers": CORS, "body": json.dumps({"error": "email already exists"})}
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.users (email, password_hash, first_name, last_name, phone)
                    VALUES (%s,%s,%s,%s,%s) RETURNING id, email, first_name, last_name, role
                """, (email, hash_password(password), body.get("first_name", ""), body.get("last_name", ""), body.get("phone", "")))
                uid, em, fn, ln, role = cur.fetchone()
                token = secrets.token_hex(32)
                cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s,%s,%s)",
                            (uid, token, datetime.now() + timedelta(days=30)))
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({
                    "token": token,
                    "user": {"id": uid, "email": em, "first_name": fn, "last_name": ln, "role": role}
                })}

            if method == "POST" and action == "login":
                email = body.get("email", "").strip().lower()
                password = body.get("password", "")
                cur.execute(f"""
                    SELECT id, email, first_name, last_name, role FROM {SCHEMA}.users
                    WHERE email=%s AND password_hash=%s
                """, (email, hash_password(password)))
                row = cur.fetchone()
                if not row:
                    return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "invalid credentials"})}
                uid, em, fn, ln, role = row
                token = secrets.token_hex(32)
                cur.execute(f"INSERT INTO {SCHEMA}.sessions (user_id, token, expires_at) VALUES (%s,%s,%s)",
                            (uid, token, datetime.now() + timedelta(days=30)))
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                    "token": token,
                    "user": {"id": uid, "email": em, "first_name": fn, "last_name": ln, "role": role}
                })}

            if method == "POST" and action == "logout":
                token = get_token(event)
                if token:
                    cur.execute(f"UPDATE {SCHEMA}.sessions SET expires_at=NOW() WHERE token=%s", (token,))
                    conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"message": "logged out"})}

        # ============ ORDERS ============
        elif section == "orders":
            token = get_token(event)
            user_row = get_user_from_token(cur, token)

            if method == "GET":
                page = int(params.get("page", 1))
                per_page = int(params.get("per_page", 20))
                offset = (page - 1) * per_page
                admin_all = params.get("all") == "true"

                if admin_all:
                    cur.execute(f"""
                        SELECT o.id, o.status, o.total, o.delivery_address, o.delivery_method, o.payment_method,
                               o.created_at, u.email, u.first_name, u.last_name
                        FROM {SCHEMA}.orders o
                        LEFT JOIN {SCHEMA}.users u ON u.id = o.user_id
                        ORDER BY o.created_at DESC LIMIT %s OFFSET %s
                    """, (per_page, offset))
                    rows = cur.fetchall()
                    orders = [{"id": r[0], "status": r[1], "total": float(r[2]) if r[2] else 0,
                               "delivery_address": r[3], "delivery_method": r[4], "payment_method": r[5],
                               "created_at": str(r[6]), "user_email": r[7],
                               "user_name": f"{r[8] or ''} {r[9] or ''}".strip()} for r in rows]
                    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.orders")
                    total = cur.fetchone()[0]
                elif user_row:
                    user_id = user_row[0]
                    cur.execute(f"""
                        SELECT o.id, o.status, o.total, o.delivery_address, o.created_at
                        FROM {SCHEMA}.orders o WHERE o.user_id = %s ORDER BY o.created_at DESC
                        LIMIT %s OFFSET %s
                    """, (user_id, per_page, offset))
                    rows = cur.fetchall()
                    orders = []
                    for row in rows:
                        cur.execute(f"""
                            SELECT oi.quantity, oi.price, p.name
                            FROM {SCHEMA}.order_items oi
                            JOIN {SCHEMA}.products p ON p.id = oi.product_id
                            WHERE oi.order_id = %s
                        """, (row[0],))
                        items = [{"quantity": i[0], "price": float(i[1]), "name": i[2]} for i in cur.fetchall()]
                        orders.append({"id": row[0], "status": row[1], "total": float(row[2]) if row[2] else 0,
                                       "delivery_address": row[3], "created_at": str(row[4]), "items": items})
                    cur.execute(f"SELECT COUNT(*) FROM {SCHEMA}.orders WHERE user_id = %s", (user_id,))
                    total = cur.fetchone()[0]
                else:
                    return {"statusCode": 401, "headers": CORS, "body": json.dumps({"error": "unauthorized"})}

                return {"statusCode": 200, "headers": CORS, "body": json.dumps({
                    "orders": orders, "total": total, "page": page, "per_page": per_page
                })}

            elif method == "POST":
                items = body.get("items", [])
                if not items:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "items required"})}
                user_id = user_row[0] if user_row else None
                total = sum(float(item["price"]) * int(item["quantity"]) for item in items)
                cur.execute(f"""
                    INSERT INTO {SCHEMA}.orders (user_id, status, total, delivery_address, delivery_method, payment_method, comment)
                    VALUES (%s,'processing',%s,%s,%s,%s,%s) RETURNING id
                """, (user_id, total, body.get("delivery_address"), body.get("delivery_method", "courier"),
                      body.get("payment_method", "card"), body.get("comment")))
                order_id = cur.fetchone()[0]
                for item in items:
                    cur.execute(f"""
                        INSERT INTO {SCHEMA}.order_items (order_id, product_id, quantity, price)
                        VALUES (%s,%s,%s,%s)
                    """, (order_id, item["product_id"], item["quantity"], item["price"]))
                conn.commit()
                return {"statusCode": 201, "headers": CORS, "body": json.dumps({"order_id": order_id, "total": total})}

            elif method == "PUT":
                order_id = body.get("id")
                status = body.get("status")
                if not order_id or not status:
                    return {"statusCode": 400, "headers": CORS, "body": json.dumps({"error": "id and status required"})}
                cur.execute(f"UPDATE {SCHEMA}.orders SET status=%s, updated_at=NOW() WHERE id=%s", (status, order_id))
                conn.commit()
                return {"statusCode": 200, "headers": CORS, "body": json.dumps({"message": "updated"})}

    finally:
        cur.close()
        conn.close()

    return {"statusCode": 404, "headers": CORS, "body": json.dumps({"error": "not found"})}
