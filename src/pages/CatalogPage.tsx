 
import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";
import ProductCard from "@/components/ProductCard";
import { Product, API_PRODUCTS, CATEGORIES, Page } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

const SORT_OPTIONS = [
  { value: "reviews_count", label: "По популярности" },
  { value: "rating", label: "По рейтингу" },
  { value: "price_asc", label: "Сначала дешевле" },
  { value: "price_desc", label: "Сначала дороже" },
  { value: "created_at", label: "Новинки" },
];

const RATING_OPTIONS = [
  { value: 0, label: "Любой" },
  { value: 4, label: "4+ ★" },
  { value: 4.5, label: "4.5+ ★" },
  { value: 4.7, label: "4.7+ ★" },
];

interface Filters {
  brands: string[];
  minPrice: number;
  maxPrice: number;
  minRating: number;
  inStock: boolean;
  hasDiscount: boolean;
}

const EMPTY_FILTERS: Filters = {
  brands: [], minPrice: 0, maxPrice: 999999,
  minRating: 0, inStock: false, hasDiscount: false,
};

function FilterBadge({ count, onClear }: { count: number; onClear: () => void }) {
  if (!count) return null;
  return (
    <button onClick={onClear} className="flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium text-[#080c14]"
      style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' }}>
      {count} фильтр{count > 1 ? 'а' : ''} <Icon name="X" size={10} />
    </button>
  );
}

export default function CatalogPage({ onAddToCart, onNavigateProduct, onNavigate }: {
  onAddToCart: (p: Product) => void;
  onNavigateProduct: (id: number) => void;
  onNavigate: (p: Page) => void;
}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [metaLoading, setMetaLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Search & sort
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("reviews_count");

  // Category
  const [category, setCategory] = useState("Все");

  // Filters
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [applied, setApplied] = useState<Filters>(EMPTY_FILTERS);

  // Meta (brands, price range) per category
  const [metaBrands, setMetaBrands] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 649990]);
  const [localMinPrice, setLocalMinPrice] = useState(0);
  const [localMaxPrice, setLocalMaxPrice] = useState(649990);
  const perPage = 16;

  // Load meta when category changes
  useEffect(() => {
    setMetaLoading(true);
    const params = new URLSearchParams({ meta: "true" });
    if (category !== "Все") params.set("category", category);
    fetch(`${API_PRODUCTS}?${params}`)
      .then(r => r.json())
      .then(d => {
        setMetaBrands(d.brands || []);
        const mn = Math.floor(d.price_min || 0);
        const mx = Math.ceil(d.price_max || 649990);
        setPriceRange([mn, mx]);
        setLocalMinPrice(mn);
        setLocalMaxPrice(mx);
        // Reset brand filter if switching category
        setFilters(f => ({ ...f, brands: [], minPrice: mn, maxPrice: mx }));
        setApplied(f => ({ ...f, brands: [], minPrice: mn, maxPrice: mx }));
      })
      .catch(() => {})
      .finally(() => setMetaLoading(false));
  }, [category]);

  const load = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), per_page: String(perPage), sort_by: sortBy });
    if (category !== "Все") params.set("category", category);
    if (search) params.set("search", search);
    if (applied.brands.length) params.set("brands", applied.brands.join(","));
    if (applied.minPrice > priceRange[0]) params.set("min_price", String(applied.minPrice));
    if (applied.maxPrice < priceRange[1]) params.set("max_price", String(applied.maxPrice));
    if (applied.minRating > 0) params.set("min_rating", String(applied.minRating));
    if (applied.inStock) params.set("in_stock", "true");
    if (applied.hasDiscount) params.set("has_discount", "true");
    fetch(`${API_PRODUCTS}?${params}`)
      .then(r => r.json())
      .then(d => { setProducts(d.products || []); setTotal(d.total || 0); })
      .finally(() => setLoading(false));
  }, [page, category, search, sortBy, applied, priceRange]);

  useEffect(() => { load(); }, [load]);

  const applyFilters = () => {
    setApplied({ ...filters, minPrice: localMinPrice, maxPrice: localMaxPrice });
    setPage(1);
    setSidebarOpen(false);
  };

  const resetFilters = () => {
    const reset = { ...EMPTY_FILTERS, minPrice: priceRange[0], maxPrice: priceRange[1] };
    setFilters(reset);
    setApplied(reset);
    setLocalMinPrice(priceRange[0]);
    setLocalMaxPrice(priceRange[1]);
    setPage(1);
  };

  const toggleBrand = (brand: string) => {
    setFilters(f => ({
      ...f,
      brands: f.brands.includes(brand) ? f.brands.filter(b => b !== brand) : [...f.brands, brand],
    }));
  };

  const activeFilterCount = [
    applied.brands.length > 0,
    applied.minPrice > priceRange[0],
    applied.maxPrice < priceRange[1],
    applied.minRating > 0,
    applied.inStock,
    applied.hasDiscount,
  ].filter(Boolean).length;

  const totalPages = Math.ceil(total / perPage);

  const SidebarContent = () => (
    <div className="space-y-6">
      {/* Категории */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Категория</div>
        <div className="space-y-0.5">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => { setCategory(c); setPage(1); setSidebarOpen(false); }}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center justify-between group
                ${category === c ? 'font-semibold text-[#080c14]' : 'text-muted-foreground hover:text-white hover:bg-white/4'}`}
              style={category === c ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
              <span>{c}</span>
              {category === c && <Icon name="Check" size={12} />}
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Цена */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Цена</div>
        <div className="space-y-3">
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-1">от ₽</label>
              <input
                type="number" value={localMinPrice}
                onChange={e => setLocalMinPrice(Math.max(priceRange[0], Math.min(localMaxPrice, Number(e.target.value))))}
                className="w-full glass rounded-lg px-2 py-1.5 text-xs outline-none border border-transparent focus:border-cyan-500/40 transition-all"
              />
            </div>
            <div className="flex-1">
              <label className="text-[10px] text-muted-foreground block mb-1">до ₽</label>
              <input
                type="number" value={localMaxPrice}
                onChange={e => setLocalMaxPrice(Math.min(priceRange[1], Math.max(localMinPrice, Number(e.target.value))))}
                className="w-full glass rounded-lg px-2 py-1.5 text-xs outline-none border border-transparent focus:border-cyan-500/40 transition-all"
              />
            </div>
          </div>
          {/* Dual range visual */}
          <div className="relative h-1.5 rounded-full bg-white/10">
            <div className="absolute h-full rounded-full"
              style={{
                left: `${((localMinPrice - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                right: `${100 - ((localMaxPrice - priceRange[0]) / (priceRange[1] - priceRange[0])) * 100}%`,
                background: 'linear-gradient(to right, #00e5ff, #9b59f5)',
              }} />
          </div>
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>{priceRange[0].toLocaleString('ru-RU')} ₽</span>
            <span>{priceRange[1].toLocaleString('ru-RU')} ₽</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Рейтинг */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Рейтинг</div>
        <div className="space-y-0.5">
          {RATING_OPTIONS.map(r => (
            <button key={r.value} onClick={() => setFilters(f => ({ ...f, minRating: r.value }))}
              className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2
                ${filters.minRating === r.value ? 'font-semibold text-[#080c14]' : 'text-muted-foreground hover:text-white hover:bg-white/4'}`}
              style={filters.minRating === r.value ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
              {r.value > 0 && <span className="text-yellow-400 text-xs">{'★'.repeat(Math.floor(r.value))}</span>}
              <span>{r.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="border-t border-border" />

      {/* Переключатели */}
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Наличие и акции</div>
        <div className="space-y-2">
          {[
            { key: "inStock" as const, label: "Есть в наличии", icon: "Package" },
            { key: "hasDiscount" as const, label: "Со скидкой", icon: "Tag" },
          ].map(opt => (
            <button key={opt.key} onClick={() => setFilters(f => ({ ...f, [opt.key]: !f[opt.key] }))}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all
                ${filters[opt.key] ? 'text-[#080c14]' : 'glass text-muted-foreground hover:text-white'}`}
              style={filters[opt.key] ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
              <Icon name={opt.icon} size={14} fallback="Box" />
              {opt.label}
              <span className={`ml-auto w-4 h-4 rounded flex items-center justify-center ${filters[opt.key] ? 'bg-[#080c14]/30' : 'border border-white/20'}`}>
                {filters[opt.key] && <Icon name="Check" size={10} />}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Бренды */}
      {metaBrands.length > 0 && (
        <>
          <div className="border-t border-border" />
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
              Бренд {filters.brands.length > 0 && <span className="text-cyan-400">({filters.brands.length})</span>}
            </div>
            {metaLoading ? (
              <div className="space-y-1.5">{[1,2,3].map(i => <div key={i} className="glass rounded-lg h-7 animate-pulse" />)}</div>
            ) : (
              <div className="space-y-0.5 max-h-56 overflow-y-auto scrollbar-hide pr-1">
                {metaBrands.map(b => (
                  <button key={b} onClick={() => toggleBrand(b)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all flex items-center gap-2
                      ${filters.brands.includes(b) ? 'text-[#080c14] font-semibold' : 'text-muted-foreground hover:text-white hover:bg-white/4'}`}
                    style={filters.brands.includes(b) ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                    <span className={`w-4 h-4 rounded border shrink-0 flex items-center justify-center transition-all
                      ${filters.brands.includes(b) ? 'bg-[#080c14]/30 border-[#080c14]/30' : 'border-white/20'}`}>
                      {filters.brands.includes(b) && <Icon name="Check" size={10} />}
                    </span>
                    {b}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Apply / Reset */}
      <div className="flex gap-2 pt-2 sticky bottom-0 pb-1" style={{ background: 'var(--bg-card)' }}>
        <button onClick={applyFilters}
          className="flex-1 gradient-btn py-2.5 rounded-xl text-sm font-bold">
          Применить
        </button>
        {activeFilterCount > 0 && (
          <button onClick={resetFilters}
            className="glass px-3 py-2.5 rounded-xl text-xs text-muted-foreground hover:text-white transition-all">
            Сбросить
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div>
    <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Каталог" }]} onNavigate={onNavigate} />
    <div className="flex gap-6 relative">
      {/* ─── Боковая панель Desktop ─── */}
      <aside className="w-60 shrink-0 hidden lg:block">
        <div className="glass rounded-2xl neon-border p-4 sticky top-24 overflow-y-auto scrollbar-hide"
          style={{ maxHeight: 'calc(100vh - 7rem)' }}>
          <div className="flex items-center justify-between mb-4">
            <span className="font-display font-bold text-sm">Фильтры</span>
            <FilterBadge count={activeFilterCount} onClear={resetFilters} />
          </div>
          <SidebarContent />
        </div>
      </aside>

      {/* ─── Мобильный drawer ─── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-72 glass-bright border-r border-white/10 overflow-y-auto p-5 animate-slide-in-right"
            style={{ animationDirection: 'normal' }}>
            <div className="flex items-center justify-between mb-5">
              <span className="font-display font-bold">Фильтры</span>
              <button onClick={() => setSidebarOpen(false)} className="text-muted-foreground hover:text-white">
                <Icon name="X" size={18} />
              </button>
            </div>
            <SidebarContent />
          </div>
        </div>
      )}

      {/* ─── Основной контент ─── */}
      <div className="flex-1 min-w-0">
        {/* Поиск и сортировка */}
        <div className="flex gap-2 mb-4">
          <div className="relative flex-1">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={e => setSearchInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { setSearch(searchInput); setPage(1); } }}
              placeholder="Поиск товаров..."
              className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all"
            />
          </div>
          {/* Кнопка фильтров — только на мобильном */}
          <button onClick={() => setSidebarOpen(true)}
            className="lg:hidden glass px-3 py-2.5 rounded-xl flex items-center gap-1.5 text-sm relative hover:border-cyan-400/30 transition-all">
            <Icon name="SlidersHorizontal" size={15} fallback="Filter" />
            {activeFilterCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold bg-pink-500 text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="glass rounded-xl px-3 py-2.5 text-sm outline-none cursor-pointer bg-transparent hidden sm:block">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Активные фильтры-чипы */}
        {activeFilterCount > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {applied.brands.map(b => (
              <button key={b} onClick={() => { setApplied(f => ({ ...f, brands: f.brands.filter(x => x !== b) })); setFilters(f => ({ ...f, brands: f.brands.filter(x => x !== b) })); setPage(1); }}
                className="flex items-center gap-1 glass px-3 py-1 rounded-full text-xs hover:border-red-400/30 transition-all">
                {b} <Icon name="X" size={10} className="text-muted-foreground" />
              </button>
            ))}
            {applied.minRating > 0 && (
              <button onClick={() => { setApplied(f => ({ ...f, minRating: 0 })); setFilters(f => ({ ...f, minRating: 0 })); setPage(1); }}
                className="flex items-center gap-1 glass px-3 py-1 rounded-full text-xs hover:border-red-400/30 transition-all">
                {applied.minRating}+ ★ <Icon name="X" size={10} className="text-muted-foreground" />
              </button>
            )}
            {applied.inStock && (
              <button onClick={() => { setApplied(f => ({ ...f, inStock: false })); setFilters(f => ({ ...f, inStock: false })); setPage(1); }}
                className="flex items-center gap-1 glass px-3 py-1 rounded-full text-xs hover:border-red-400/30 transition-all">
                В наличии <Icon name="X" size={10} className="text-muted-foreground" />
              </button>
            )}
            {applied.hasDiscount && (
              <button onClick={() => { setApplied(f => ({ ...f, hasDiscount: false })); setFilters(f => ({ ...f, hasDiscount: false })); setPage(1); }}
                className="flex items-center gap-1 glass px-3 py-1 rounded-full text-xs hover:border-red-400/30 transition-all">
                Со скидкой <Icon name="X" size={10} className="text-muted-foreground" />
              </button>
            )}
            {(applied.minPrice > priceRange[0] || applied.maxPrice < priceRange[1]) && (
              <button onClick={() => { setApplied(f => ({ ...f, minPrice: priceRange[0], maxPrice: priceRange[1] })); setFilters(f => ({ ...f, minPrice: priceRange[0], maxPrice: priceRange[1] })); setLocalMinPrice(priceRange[0]); setLocalMaxPrice(priceRange[1]); setPage(1); }}
                className="flex items-center gap-1 glass px-3 py-1 rounded-full text-xs hover:border-red-400/30 transition-all">
                {applied.minPrice.toLocaleString('ru-RU')}–{applied.maxPrice.toLocaleString('ru-RU')} ₽ <Icon name="X" size={10} className="text-muted-foreground" />
              </button>
            )}
            <button onClick={resetFilters} className="text-xs text-muted-foreground hover:text-red-400 transition-colors px-1">
              Сбросить всё
            </button>
          </div>
        )}

        {/* Инфострока */}
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs text-muted-foreground">
            {loading ? "Загрузка..." : `Найдено: ${total} товаров`}
          </p>
          <select
            value={sortBy}
            onChange={e => { setSortBy(e.target.value); setPage(1); }}
            className="glass rounded-xl px-3 py-1.5 text-xs outline-none cursor-pointer bg-transparent sm:hidden">
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>

        {/* Грид товаров */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {[...Array(8)].map((_, i) => <div key={i} className="glass rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <Icon name="SearchX" size={48} className="mx-auto mb-4 text-muted-foreground opacity-30" fallback="Search" />
            <p className="text-muted-foreground mb-3">Ничего не найдено</p>
            <button onClick={resetFilters} className="gradient-btn px-6 py-2 rounded-xl text-sm">Сбросить фильтры</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onNavigateProduct={onNavigateProduct} />
            ))}
          </div>
        )}

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="glass px-4 py-2 rounded-xl text-sm disabled:opacity-40 hover:border-cyan-400/30 transition-all flex items-center gap-1">
              <Icon name="ChevronLeft" size={14} /> Назад
            </button>
            <div className="flex gap-1">
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p: number;
                if (totalPages <= 7) p = i + 1;
                else if (page <= 4) p = i + 1;
                else if (page >= totalPages - 3) p = totalPages - 6 + i;
                else p = page - 3 + i;
                return (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${page === p ? 'text-[#080c14]' : 'glass text-muted-foreground hover:text-white'}`}
                    style={page === p ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                    {p}
                  </button>
                );
              })}
            </div>
            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}
              className="glass px-4 py-2 rounded-xl text-sm disabled:opacity-40 hover:border-cyan-400/30 transition-all flex items-center gap-1">
              Вперёд <Icon name="ChevronRight" size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
    </div>
  );
}