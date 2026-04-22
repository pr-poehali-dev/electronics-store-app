/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import { Page, Product, API_PRODUCTS } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AdminProductsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<Partial<Product> | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "15" });
    if (search) params.set("search", search);
    fetch(`${API_PRODUCTS}?${params}`).then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [page, search]);

  useEffect(() => { load(); }, [load]);

  const saveProduct = async () => {
    if (!editing?.name || !editing?.price) return;
    setSaving(true);
    const method = editing.id ? "PUT" : "POST";
    await fetch(API_PRODUCTS, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(editing) });
    setSaving(false); setEditing(null); load();
  };

  const deleteProduct = async (id: number) => {
    if (!confirm("Скрыть товар?")) return;
    await fetch(`${API_PRODUCTS}?id=${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="space-y-5">
      <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Администратор", page: "admin" }, { label: "Товары" }]} onNavigate={onNavigate} />
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => onNavigate("admin")} className="text-muted-foreground hover:text-white transition-colors"><Icon name="ArrowLeft" size={20} /></button>
          <h2 className="font-display font-bold text-xl">Товары <span className="text-muted-foreground text-base font-normal">({total})</span></h2>
        </div>
        <button onClick={() => setEditing({ is_active: true, stock: 0, rating: 0, reviews_count: 0 })} className="gradient-btn px-4 py-2 rounded-xl text-sm flex items-center gap-2">
          <Icon name="Plus" size={14} />Добавить товар
        </button>
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
                  <th className="text-left p-4">Товар</th>
                  <th className="text-left p-4 hidden sm:table-cell">Категория</th>
                  <th className="text-right p-4">Цена</th>
                  <th className="text-right p-4 hidden md:table-cell">Остаток</th>
                  <th className="text-right p-4">Действия</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p.id} className="border-b border-border/50 hover:bg-white/2 transition-colors">
                    <td className="p-4"><div className="font-medium leading-tight">{p.name}</div><div className="text-xs text-muted-foreground">{p.brand}</div></td>
                    <td className="p-4 hidden sm:table-cell text-muted-foreground">{p.category}</td>
                    <td className="p-4 text-right font-medium text-cyan-400">{p.price.toLocaleString('ru-RU')} ₽</td>
                    <td className="p-4 text-right hidden md:table-cell"><span className={p.stock < 10 ? "text-orange-400" : "text-muted-foreground"}>{p.stock}</span></td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditing(p)} className="glass px-2 py-1 rounded-lg text-xs hover:border-cyan-400/30 transition-all"><Icon name="Edit" size={12} className="text-cyan-400" /></button>
                        <button onClick={() => deleteProduct(p.id)} className="glass px-2 py-1 rounded-lg text-xs hover:border-red-400/30 transition-all"><Icon name="Trash2" size={12} className="text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {total > 15 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-border">
              <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="text-xs text-muted-foreground hover:text-white disabled:opacity-40">← Назад</button>
              <span className="text-xs text-muted-foreground">{page} / {Math.ceil(total / 15)}</span>
              <button disabled={page >= Math.ceil(total / 15)} onClick={() => setPage(p => p + 1)} className="text-xs text-muted-foreground hover:text-white disabled:opacity-40">Вперёд →</button>
            </div>
          )}
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass rounded-2xl p-6 neon-border w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-display font-bold text-base">{editing.id ? "Редактировать" : "Добавить товар"}</h3>
              <button onClick={() => setEditing(null)} className="text-muted-foreground hover:text-white"><Icon name="X" size={18} /></button>
            </div>
            <div className="space-y-3">
              {[
                { key: "name", label: "Название *", type: "text" }, { key: "brand", label: "Бренд", type: "text" },
                { key: "category", label: "Категория", type: "text" }, { key: "price", label: "Цена *", type: "number" },
                { key: "old_price", label: "Старая цена", type: "number" }, { key: "stock", label: "Остаток", type: "number" },
                { key: "badge", label: "Бейдж", type: "text" }, { key: "warranty", label: "Гарантия", type: "text" },
                { key: "power_info", label: "Автономность", type: "text" }, { key: "img_url", label: "URL изображения", type: "text" },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-muted-foreground mb-1 block">{f.label}</label>
                  <input type={f.type} value={(editing as any)[f.key] || ""}
                    onChange={e => setEditing(ed => ({ ...ed!, [f.key]: f.type === "number" ? Number(e.target.value) : e.target.value }))}
                    className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Описание</label>
                <textarea value={editing.description || ""} rows={3}
                  onChange={e => setEditing(ed => ({ ...ed!, description: e.target.value }))}
                  className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all resize-none" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={saveProduct} disabled={saving} className="gradient-btn flex-1 py-3 rounded-xl font-bold text-sm">{saving ? "..." : "Сохранить"}</button>
                <button onClick={() => setEditing(null)} className="glass flex-1 py-3 rounded-xl text-sm">Отмена</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}