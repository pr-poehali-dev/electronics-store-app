/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Page, API_ADMIN } from "@/lib/constants";

export default function AdminAnalyticsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [overview, setOverview] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [revenue, setRevenue] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_ADMIN}?section=analytics&type=overview`).then(r => r.json()).then(setOverview).catch(() => {});
    fetch(`${API_ADMIN}?section=analytics&type=categories`).then(r => r.json()).then(d => setCategories(d.categories || [])).catch(() => {});
    fetch(`${API_ADMIN}?section=analytics&type=products`).then(r => r.json()).then(d => setTopProducts(d.products || [])).catch(() => {});
    fetch(`${API_ADMIN}?section=analytics&type=revenue&period=30`).then(r => r.json()).then(d => setRevenue(d.data || [])).catch(() => {});
  }, []);

  const maxRevenue = Math.max(...revenue.map((r: any) => r.revenue), 1);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => onNavigate("admin")} className="text-muted-foreground hover:text-white transition-colors"><Icon name="ArrowLeft" size={20} /></button>
        <h2 className="font-display font-bold text-xl">Аналитика и отчёты</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overview ? [
          { icon: "DollarSign", label: "Общая выручка", value: `${overview.revenue_total.toLocaleString('ru-RU')} ₽`, color: '#00e5ff' },
          { icon: "ShoppingBag", label: "Всего заказов", value: String(overview.orders_total), color: '#9b59f5' },
          { icon: "Users", label: "Клиентов", value: String(overview.users_total), color: '#ff2d78' },
          { icon: "Package", label: "Товаров", value: String(overview.products_count), color: '#ff6b2b' },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5 neon-border">
            <Icon name={s.icon} size={18} style={{ color: s.color }} fallback="BarChart2" />
            <div className="font-display font-black text-xl mt-2" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        )) : [...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}
      </div>

      {revenue.length > 0 && (
        <div className="glass rounded-2xl p-5 neon-border">
          <h3 className="font-display font-bold text-base mb-4">Выручка за 30 дней</h3>
          <div className="flex items-end gap-1 h-32">
            {revenue.map((r: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center group relative">
                <div className="absolute bottom-6 glass rounded px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                  {r.revenue.toLocaleString('ru-RU')} ₽
                </div>
                <div className="w-full rounded-t-sm transition-all hover:opacity-80"
                  style={{ height: `${(r.revenue / maxRevenue) * 100}%`, background: 'linear-gradient(to top, #00e5ff, #9b59f5)', minHeight: 2 }} />
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>{revenue[0]?.date}</span><span>{revenue[revenue.length - 1]?.date}</span>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5 neon-border">
          <h3 className="font-display font-bold text-base mb-4">По категориям</h3>
          <div className="space-y-3">
            {categories.map((c: any) => {
              const maxCount = Math.max(...categories.map((x: any) => x.count), 1);
              return (
                <div key={c.category}>
                  <div className="flex justify-between text-sm mb-1"><span>{c.category}</span><span className="text-muted-foreground">{c.count} тов.</span></div>
                  <div className="h-2 rounded-full bg-white/5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(c.count / maxCount) * 100}%`, background: 'linear-gradient(to right, #00e5ff, #9b59f5)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="glass rounded-2xl p-5 neon-border">
          <h3 className="font-display font-bold text-base mb-4">Топ товаров по продажам</h3>
          <div className="space-y-3">
            {topProducts.length === 0 ? <p className="text-muted-foreground text-sm">Заказов пока нет</p>
              : topProducts.map((p: any, i: number) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold w-5 text-muted-foreground">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{p.name}</div>
                    <div className="text-xs text-muted-foreground">{p.units_sold} продаж · склад: {p.stock}</div>
                  </div>
                  <div className="text-sm font-bold text-cyan-400">{p.price.toLocaleString('ru-RU')} ₽</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
