/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { Page, API_ADMIN } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AdminPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [stats, setStats] = useState<any>(null);
  useEffect(() => {
    fetch(`${API_ADMIN}?section=analytics&type=overview`).then(r => r.json()).then(setStats).catch(() => {});
  }, []);

  const adminMenus: { icon: string; label: string; sub: string; page: Page }[] = [
    { icon: "Package", label: "Товары", sub: "Добавление и редактирование каталога", page: "admin-products" },
    { icon: "ShoppingBag", label: "Заказы", sub: "Все заказы и управление статусами", page: "orders" },
    { icon: "Users", label: "Клиенты", sub: "База клиентов и история покупок", page: "admin-customers" },
    { icon: "BarChart2", label: "Аналитика", sub: "Отчёты, выручка, популярные товары", page: "admin-analytics" },
  ];

  return (
    <div className="space-y-6">
      <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Администратор" }]} onNavigate={onNavigate} />
      <h2 className="font-display font-bold text-2xl">Панель администратора</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats ? [
          { icon: "TrendingUp", label: "Выручка 30д", value: `${stats.revenue_30.toLocaleString('ru-RU')} ₽`, delta: `${stats.revenue_delta > 0 ? '+' : ''}${stats.revenue_delta}%`, color: '#00e5ff' },
          { icon: "ShoppingBag", label: "Заказов 30д", value: String(stats.orders_30), delta: `${stats.orders_delta > 0 ? '+' : ''}${stats.orders_delta}%`, color: '#9b59f5' },
          { icon: "Users", label: "Новых клиентов", value: String(stats.users_new), delta: "", color: '#ff2d78' },
          { icon: "Package", label: "Товаров", value: String(stats.products_count), delta: `${stats.low_stock} мало`, color: '#ff6b2b' },
        ].map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-5 neon-border">
            <div className="flex items-center justify-between mb-3">
              <Icon name={s.icon} size={20} style={{ color: s.color }} fallback="BarChart2" />
              {s.delta && <span className="text-xs text-emerald-400 font-medium">{s.delta}</span>}
            </div>
            <div className="font-display font-black text-xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        )) : [...Array(4)].map((_, i) => <div key={i} className="glass rounded-2xl h-24 animate-pulse" />)}
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {adminMenus.map(m => (
          <button key={m.label} onClick={() => onNavigate(m.page)} className="glass rounded-2xl p-5 neon-border text-left card-hover group flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(155,89,245,0.15))' }}>
              <Icon name={m.icon} size={22} className="text-cyan-400" fallback="Settings" />
            </div>
            <div className="flex-1">
              <div className="font-display font-bold text-base">{m.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{m.sub}</div>
            </div>
            <Icon name="ArrowRight" size={16} className="text-muted-foreground group-hover:text-cyan-400 transition-colors mt-1" />
          </button>
        ))}
      </div>
    </div>
  );
}