/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Page, API_ADMIN } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AdminCustomersPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ section: "customers", page: String(page), per_page: "20" });
    if (search) params.set("search", search);
    fetch(`${API_ADMIN}?${params}`).then(r => r.json())
      .then(d => { setCustomers(d.customers || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 flex-wrap">
        <button onClick={() => onNavigate("admin")} className="text-muted-foreground hover:text-white transition-colors"><Icon name="ArrowLeft" size={20} /></button>
        <h2 className="font-display font-bold text-xl">Клиенты <span className="text-muted-foreground text-base font-normal">({total})</span></h2>
      </div>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)} onKeyDown={e => e.key === "Enter" && (setSearch(searchInput), setPage(1))} placeholder="Поиск..." className="w-full glass rounded-xl pl-8 pr-4 py-2 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
        </div>
        <button onClick={() => { setSearch(searchInput); setPage(1); }} className="gradient-btn px-3 py-2 rounded-xl text-sm">Найти</button>
      </div>
      {loading ? <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="glass rounded-xl h-14 animate-pulse" />)}</div> : (
        <div className="glass rounded-2xl neon-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-xs text-muted-foreground">
                  <th className="text-left p-4">Клиент</th>
                  <th className="text-left p-4 hidden sm:table-cell">Регистрация</th>
                  <th className="text-right p-4 hidden md:table-cell">Заказов</th>
                  <th className="text-right p-4">Потрачено</th>
                  <th className="text-right p-4 hidden sm:table-cell">Роль</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Клиентов пока нет — зарегистрируйтесь первым!</td></tr>
                ) : customers.map(c => (
                  <tr key={c.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                    <td className="p-4"><div className="font-medium">{c.first_name} {c.last_name}</div><div className="text-xs text-muted-foreground">{c.email}</div></td>
                    <td className="p-4 hidden sm:table-cell text-muted-foreground text-xs">{new Date(c.created_at).toLocaleDateString('ru-RU')}</td>
                    <td className="p-4 text-right hidden md:table-cell text-muted-foreground">{c.orders_count}</td>
                    <td className="p-4 text-right font-medium text-cyan-400">{c.total_spent.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-4 text-right hidden sm:table-cell">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${c.role === "admin" ? "text-purple-300 bg-purple-400/10" : "text-muted-foreground bg-white/5"}`}>
                        {c.role === "admin" ? "Админ" : "Клиент"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 20 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs text-muted-foreground hover:text-white disabled:opacity-40">← Назад</button>
              <span className="text-xs text-muted-foreground">{page} / {Math.ceil(total / 20)}</span>
              <button disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)} className="text-xs text-muted-foreground hover:text-white disabled:opacity-40">Вперёд →</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}