 
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import ProductCard from "@/components/ProductCard";
import { Product, API_PRODUCTS, CATEGORIES } from "@/lib/constants";

export default function CatalogPage({ onAddToCart, onNavigateProduct }: { onAddToCart: (p: Product) => void; onNavigateProduct: (id: number) => void }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [sortBy, setSortBy] = useState("reviews_count");
  const [searchInput, setSearchInput] = useState("");

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: "18", sort_by: sortBy });
    if (category !== "Все") params.set("category", category);
    if (search) params.set("search", search);
    fetch(`${API_PRODUCTS}?${params}`).then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [page, category, search, sortBy]);

  useEffect(() => { load(); }, [load]);

  return (
    <div>
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={searchInput} onChange={e => setSearchInput(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
            placeholder="Поиск товаров..."
            className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
        </div>
        <button onClick={() => { setSearch(searchInput); setPage(1); }} className="gradient-btn px-4 py-2 rounded-xl text-sm">Найти</button>
        <select value={sortBy} onChange={e => { setSortBy(e.target.value); setPage(1); }}
          className="glass rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer bg-transparent">
          <option value="reviews_count">По популярности</option>
          <option value="price_asc">Дешевле</option>
          <option value="price_desc">Дороже</option>
          <option value="rating">По рейтингу</option>
          <option value="created_at">Новинки</option>
        </select>
      </div>

      <div className="flex gap-2 mb-5 flex-wrap">
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => { setCategory(c); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-sm transition-all ${category === c ? 'text-[#080c14] font-semibold' : 'glass text-muted-foreground hover:text-white'}`}
            style={category === c ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
            {c}
          </button>
        ))}
      </div>

      <div className="text-xs text-muted-foreground mb-4">Найдено: {total} товаров</div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => <div key={i} className="glass rounded-2xl h-72 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onNavigateProduct={onNavigateProduct} />)}
        </div>
      )}

      {total > 18 && (
        <div className="flex justify-center gap-2 mt-8">
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)} className="glass px-4 py-2 rounded-xl text-sm disabled:opacity-40 hover:border-cyan-400/30 transition-all">← Назад</button>
          <span className="glass px-4 py-2 rounded-xl text-sm">{page} / {Math.ceil(total / 18)}</span>
          <button disabled={page >= Math.ceil(total / 18)} onClick={() => setPage(p => p + 1)} className="glass px-4 py-2 rounded-xl text-sm disabled:opacity-40 hover:border-cyan-400/30 transition-all">Вперёд →</button>
        </div>
      )}
    </div>
  );
}
