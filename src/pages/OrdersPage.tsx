/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Page, User, API_AUTH_ORDERS, STATUS_LABELS, STATUS_COLORS } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function OrdersPage({ token, user, onNavigate }: { token: string; user: User | null; onNavigate: (p: Page) => void }) {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_AUTH_ORDERS}?section=orders`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json()).then(d => setOrders(d.orders || [])).finally(() => setLoading(false));
  }, [token]);

  if (!user) return (
    <div className="text-center py-24">
      <Icon name="Lock" size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
      <h2 className="font-display font-bold text-xl mb-2">Войдите в аккаунт</h2>
      <p className="text-muted-foreground mb-6">Чтобы видеть свои заказы</p>
      <button onClick={() => onNavigate("auth")} className="gradient-btn px-8 py-3 rounded-2xl">Войти</button>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Профиль", page: "profile" }, { label: "Мои заказы" }]} onNavigate={onNavigate} />
      <h2 className="font-display font-bold text-2xl mb-6">Мои заказы</h2>
      {loading ? <div className="space-y-3">{[1, 2].map(i => <div key={i} className="glass rounded-2xl h-20 animate-pulse" />)}</div>
        : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Icon name="Package" size={48} className="mx-auto mb-4 opacity-30" />
            <p>Заказов пока нет</p>
            <button onClick={() => onNavigate("catalog")} className="gradient-btn px-6 py-2 rounded-xl mt-4 text-sm">В каталог</button>
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order: any, i: number) => (
              <div key={order.id} className="glass rounded-2xl p-5 neon-border card-hover animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
                <div className="flex flex-wrap gap-3 items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(155,89,245,0.15))' }}>
                      <Icon name="Package" size={18} className="text-cyan-400" />
                    </div>
                    <div>
                      <div className="font-bold font-display">Заказ #{order.id}</div>
                      <div className="text-xs text-muted-foreground">{new Date(order.created_at).toLocaleDateString('ru-RU')}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? 'text-muted-foreground'}`}>{STATUS_LABELS[order.status] || order.status}</span>
                    <div className="font-bold text-cyan-400">{order.total.toLocaleString('ru-RU')} ₽</div>
                  </div>
                </div>
                {order.items?.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border text-xs text-muted-foreground space-y-1">
                    {order.items.map((item: any, j: number) => <div key={j}>{item.name} × {item.quantity} — {(item.price * item.quantity).toLocaleString('ru-RU')} ₽</div>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
    </div>
  );
}