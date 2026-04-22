/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";

// API URLs
const API_PRODUCTS = "https://functions.poehali.dev/1db3436b-c29c-4d57-be60-e93e3b495485";
const API_AUTH_ORDERS = "https://functions.poehali.dev/813df701-049a-486d-bdd1-f0298ddecaeb";
const API_ADMIN = "https://functions.poehali.dev/c2f99a74-f275-4898-9efb-1eb0ee5ccfd4";

const HERO_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/f0874d31-46a3-403a-b8d9-a111da942884.jpg";
const CATALOG_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/0b1b6e37-0a99-4e72-bdfc-19102cac72b2.jpg";
const GADGETS_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/2b3f9fd8-0496-43f6-99e6-6d644bf3dcd6.jpg";

type Page = "home" | "catalog" | "product" | "cart" | "checkout" | "orders" | "profile" | "admin" | "admin-products" | "admin-customers" | "admin-analytics" | "contacts" | "auth";

interface User { id: number; email: string; first_name: string; last_name: string; role: string; }
interface Product {
  id: number; name: string; brand: string; category: string; price: number; old_price?: number | null;
  rating: number; reviews_count: number; power_info?: string; warranty?: string; badge?: string | null;
  description?: string; img_url?: string; stock: number; is_active: boolean;
}
interface CartItem extends Product { quantity: number; }

const STATUS_LABELS: Record<string, string> = {
  processing: "Обрабатывается", shipped: "Отправлен", delivered: "Доставлен",
  cancelled: "Отменён", pending: "Ожидает оплаты"
};
const STATUS_COLORS: Record<string, string> = {
  delivered: "text-emerald-400 bg-emerald-400/10",
  shipped: "text-cyan-400 bg-cyan-400/10",
  processing: "text-yellow-400 bg-yellow-400/10",
  cancelled: "text-red-400 bg-red-400/10",
  pending: "text-orange-400 bg-orange-400/10",
};
const CATEGORIES = ["Все", "Смартфоны", "Ноутбуки", "Аудио", "Носимые", "Планшеты", "Аксессуары", "Камеры"];

function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string>(() => localStorage.getItem("tv_token") || "");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    fetch(`${API_AUTH_ORDERS}?section=auth&action=me`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.json()).then(d => { if (d.user) setUser(d.user); else { setToken(""); localStorage.removeItem("tv_token"); } })
      .catch(() => { setToken(""); localStorage.removeItem("tv_token"); })
      .finally(() => setLoading(false));
  }, [token]);

  const login = async (email: string, password: string) => {
    const r = await fetch(`${API_AUTH_ORDERS}?section=auth&action=login`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    const d = await r.json();
    if (d.token) { setToken(d.token); setUser(d.user); localStorage.setItem("tv_token", d.token); return { ok: true }; }
    return { ok: false, error: d.error };
  };

  const register = async (data: { email: string; password: string; first_name: string; last_name: string; phone?: string }) => {
    const r = await fetch(`${API_AUTH_ORDERS}?section=auth&action=register`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    });
    const d = await r.json();
    if (d.token) { setToken(d.token); setUser(d.user); localStorage.setItem("tv_token", d.token); return { ok: true }; }
    return { ok: false, error: d.error };
  };

  const logout = async () => {
    await fetch(`${API_AUTH_ORDERS}?section=auth&action=logout`, {
      method: "POST", headers: { "Authorization": `Bearer ${token}` }
    }).catch(() => {});
    setToken(""); setUser(null); localStorage.removeItem("tv_token");
  };

  return { user, token, loading, login, register, logout };
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.floor(rating) ? "text-yellow-400" : "text-gray-600"} style={{ fontSize: 12 }}>★</span>
      ))}
    </div>
  );
}

function ProductCard({ product, onAddToCart, onNavigateProduct }: { product: Product; onAddToCart: (p: Product) => void; onNavigateProduct?: (id: number) => void }) {
  const img = product.img_url || GADGETS_IMG;
  return (
    <div className="glass card-hover rounded-2xl overflow-hidden neon-border group flex flex-col">
      <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => onNavigateProduct?.(product.id)}>
        <img src={img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent" />
        {product.badge && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>
            {product.badge}
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">Мало</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-muted-foreground mb-1">{product.brand} · {product.category}</div>
        <div className="font-semibold text-sm leading-tight mb-2 text-white flex-1 cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => onNavigateProduct?.(product.id)}>{product.name}</div>
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-muted-foreground">{product.reviews_count}</span>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mb-3">
          {product.power_info && <span className="flex items-center gap-1"><Icon name="Zap" size={10} className="text-cyan-400" />{product.power_info}</span>}
          {product.warranty && <span className="flex items-center gap-1"><Icon name="Shield" size={10} className="text-purple-400" />{product.warranty}</span>}
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="text-lg font-bold text-cyan-400">{product.price.toLocaleString('ru-RU')} ₽</div>
            {product.old_price && <div className="text-xs text-muted-foreground line-through">{product.old_price.toLocaleString('ru-RU')} ₽</div>}
          </div>
          <button onClick={() => onAddToCart(product)} disabled={product.stock === 0}
            className="gradient-btn px-3 py-2 rounded-xl text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
            <Icon name="Plus" size={14} />{product.stock === 0 ? "Нет" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============ PRODUCT PAGE ============
function ProductPage({ productId, onNavigate, onAddToCart }: { productId: number; onNavigate: (p: Page) => void; onAddToCart: (p: Product) => void }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "delivery">("desc");

  useEffect(() => {
    setLoading(true); setAdded(false); setQty(1);
    fetch(`${API_PRODUCTS}?id=${productId}`).then(r => r.json()).then(p => {
      setProduct(p);
      if (p.category) {
        fetch(`${API_PRODUCTS}?category=${encodeURIComponent(p.category)}&per_page=4`).then(r => r.json()).then(d => {
          setRelated((d.products || []).filter((x: Product) => x.id !== productId).slice(0, 3));
        }).catch(() => {});
      }
    }).catch(() => {}).finally(() => setLoading(false));
  }, [productId]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < qty; i++) onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const discount = product?.old_price ? Math.round((1 - product.price / product.old_price) * 100) : 0;

  if (loading) return (
    <div className="max-w-5xl mx-auto animate-pulse space-y-6">
      <div className="glass rounded-2xl h-8 w-40" />
      <div className="grid md:grid-cols-2 gap-8">
        <div className="glass rounded-3xl h-80" />
        <div className="space-y-4">
          {[1,2,3,4,5].map(i => <div key={i} className="glass rounded-xl h-8" />)}
        </div>
      </div>
    </div>
  );

  if (!product) return (
    <div className="text-center py-24">
      <Icon name="PackageX" size={48} className="mx-auto mb-4 text-muted-foreground opacity-40" fallback="Package" />
      <h2 className="font-display font-bold text-xl mb-2">Товар не найден</h2>
      <button onClick={() => onNavigate("catalog")} className="gradient-btn px-6 py-3 rounded-2xl mt-4">В каталог</button>
    </div>
  );

  const img = product.img_url || GADGETS_IMG;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <button onClick={() => onNavigate("home")} className="hover:text-white transition-colors">Главная</button>
        <Icon name="ChevronRight" size={12} />
        <button onClick={() => onNavigate("catalog")} className="hover:text-white transition-colors">Каталог</button>
        <Icon name="ChevronRight" size={12} />
        <span className="text-white truncate max-w-xs">{product.name}</span>
      </div>

      {/* Main block */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="relative">
          <div className="glass rounded-3xl overflow-hidden neon-border aspect-square flex items-center justify-center">
            <img src={img} alt={product.name} className="w-full h-full object-cover" />
            {product.badge && (
              <span className="absolute top-4 left-4 text-sm font-bold px-3 py-1.5 rounded-full z-10"
                style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>
                {product.badge}
              </span>
            )}
            {discount > 0 && (
              <span className="absolute top-4 right-4 text-sm font-bold px-3 py-1.5 rounded-full z-10 bg-pink-500/90 text-white">
                −{discount}%
              </span>
            )}
          </div>
          {/* Stock indicator */}
          <div className="flex items-center gap-2 mt-3 px-1">
            <span className={`w-2 h-2 rounded-full ${product.stock > 10 ? 'bg-emerald-400' : product.stock > 0 ? 'bg-orange-400' : 'bg-red-400'}`} />
            <span className="text-xs text-muted-foreground">
              {product.stock > 10 ? 'Много в наличии' : product.stock > 0 ? `Осталось ${product.stock} шт.` : 'Нет в наличии'}
            </span>
          </div>
        </div>

        {/* Info */}
        <div className="space-y-5">
          <div>
            <div className="text-xs text-muted-foreground mb-1">{product.brand} · {product.category}</div>
            <h1 className="font-display font-black text-2xl md:text-3xl leading-tight">{product.name}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StarRating rating={product.rating} />
            <span className="text-sm text-muted-foreground">{product.reviews_count} отзывов</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-muted-foreground">ID: {product.id}</span>
          </div>

          {/* Price */}
          <div className="glass rounded-2xl p-4 neon-border">
            <div className="flex items-end gap-3">
              <span className="font-display font-black text-3xl text-cyan-400">{product.price.toLocaleString('ru-RU')} ₽</span>
              {product.old_price && (
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground line-through">{product.old_price.toLocaleString('ru-RU')} ₽</span>
                  <span className="text-xs text-emerald-400 font-medium">Экономия {(product.old_price - product.price).toLocaleString('ru-RU')} ₽</span>
                </div>
              )}
            </div>
          </div>

          {/* Specs chips */}
          <div className="flex flex-wrap gap-2">
            {product.power_info && (
              <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs">
                <Icon name="Zap" size={12} className="text-cyan-400" />
                <span>{product.power_info}</span>
              </div>
            )}
            {product.warranty && (
              <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs">
                <Icon name="Shield" size={12} className="text-purple-400" />
                <span>Гарантия {product.warranty}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs">
              <Icon name="Truck" size={12} className="text-emerald-400" />
              <span>Доставка 1–3 дня</span>
            </div>
            <div className="flex items-center gap-1.5 glass px-3 py-1.5 rounded-xl text-xs">
              <Icon name="RotateCcw" size={12} className="text-orange-400" />
              <span>Возврат 14 дней</span>
            </div>
          </div>

          {/* Quantity + Add to cart */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">Количество:</span>
              <div className="flex items-center glass rounded-xl overflow-hidden neon-border">
                <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-2 hover:bg-white/5 transition-colors text-lg leading-none">−</button>
                <span className="px-4 py-2 font-bold text-sm min-w-[3rem] text-center">{qty}</span>
                <button onClick={() => setQty(q => Math.min(product.stock, q + 1))} className="px-3 py-2 hover:bg-white/5 transition-colors text-lg leading-none">+</button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={handleAddToCart} disabled={product.stock === 0}
                className={`flex-1 py-3 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all ${added ? 'bg-emerald-500 text-white' : 'gradient-btn'} disabled:opacity-40 disabled:cursor-not-allowed`}>
                <Icon name={added ? "Check" : "ShoppingCart"} size={16} />
                {product.stock === 0 ? "Нет в наличии" : added ? "Добавлено!" : `В корзину · ${(product.price * qty).toLocaleString('ru-RU')} ₽`}
              </button>
              <button className="glass px-4 py-3 rounded-2xl hover:border-pink-400/30 transition-all">
                <Icon name="Heart" size={18} className="text-pink-400" />
              </button>
            </div>
            {added && (
              <button onClick={() => onNavigate("cart")} className="w-full text-center text-sm text-cyan-400 hover:text-cyan-300 transition-colors flex items-center justify-center gap-1">
                Перейти в корзину <Icon name="ArrowRight" size={14} />
              </button>
            )}
          </div>

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: "BadgeCheck", label: "Оригинал", sub: "Официальный товар" },
              { icon: "CreditCard", label: "Рассрочка", sub: "0% на 12 мес." },
              { icon: "Headset", label: "Поддержка", sub: "24/7 онлайн" },
            ].map(b => (
              <div key={b.label} className="glass rounded-xl p-3 text-center">
                <Icon name={b.icon} size={16} className="text-cyan-400 mx-auto mb-1" fallback="Star" />
                <div className="text-xs font-semibold">{b.label}</div>
                <div className="text-[10px] text-muted-foreground">{b.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="glass rounded-2xl neon-border overflow-hidden">
        <div className="flex border-b border-border">
          {([
            { id: "desc", label: "Описание" },
            { id: "specs", label: "Характеристики" },
            { id: "delivery", label: "Доставка и оплата" },
          ] as const).map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-sm font-medium transition-all ${activeTab === tab.id ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-muted-foreground hover:text-white'}`}>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === "desc" && (
            <div className="text-muted-foreground leading-relaxed">
              {product.description || `${product.name} — отличный выбор в категории ${product.category}. Производитель ${product.brand} гарантирует высокое качество и надёжность. Товар прошёл проверку качества и поставляется с официальной гарантией ${product.warranty || ''}.`}
            </div>
          )}
          {activeTab === "specs" && (
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                { label: "Бренд", value: product.brand },
                { label: "Категория", value: product.category },
                { label: "Гарантия", value: product.warranty || "—" },
                { label: "Автономность / Мощность", value: product.power_info || "—" },
                { label: "Наличие", value: product.stock > 0 ? `${product.stock} шт.` : "Нет в наличии" },
                { label: "Артикул", value: `TV-${String(product.id).padStart(5, '0')}` },
              ].map(s => (
                <div key={s.label} className="flex justify-between py-2 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground text-sm">{s.label}</span>
                  <span className="text-sm font-medium">{s.value}</span>
                </div>
              ))}
            </div>
          )}
          {activeTab === "delivery" && (
            <div className="space-y-4">
              {[
                { icon: "Truck", title: "Курьерская доставка", desc: "1–3 рабочих дня по России. Бесплатно при заказе от 5 000 ₽.", color: "text-cyan-400" },
                { icon: "MapPin", title: "Самовывоз", desc: "Москва, ул. Технологическая, 14. Готово к выдаче в день заказа.", color: "text-purple-400" },
                { icon: "CreditCard", title: "Оплата картой", desc: "Visa, MasterCard, МИР. Оплата на сайте или при получении.", color: "text-emerald-400" },
                { icon: "Smartphone", title: "СБП", desc: "Система быстрых платежей. Мгновенное зачисление без комиссии.", color: "text-orange-400" },
              ].map(d => (
                <div key={d.title} className="flex gap-4 items-start">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <Icon name={d.icon} size={16} className={d.color} fallback="Info" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{d.title}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{d.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {related.length > 0 && (
        <section>
          <h2 className="font-display font-bold text-xl mb-4">Похожие товары</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {related.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onNavigateProduct={(id) => { window.scrollTo({top:0,behavior:'smooth'}); setProduct(null); setLoading(true); fetch(`${API_PRODUCTS}?id=${id}`).then(r=>r.json()).then(np=>{setProduct(np);setLoading(false);}).catch(()=>setLoading(false)); }} />)}
          </div>
        </section>
      )}
    </div>
  );
}

function HomePage({ onNavigate, onAddToCart, onNavigateProduct }: { onNavigate: (p: Page) => void; onAddToCart: (p: Product) => void; onNavigateProduct: (id: number) => void }) {
  const [featured, setFeatured] = useState<Product[]>([]);
  useEffect(() => {
    fetch(`${API_PRODUCTS}?per_page=6`).then(r => r.json()).then(d => setFeatured(d.products || [])).catch(() => {});
  }, []);

  return (
    <div className="space-y-16">
      <section className="relative rounded-3xl overflow-hidden min-h-[480px] flex items-center">
        <img src={HERO_IMG} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,12,20,0.95) 0%, rgba(8,12,20,0.6) 60%, transparent 100%)' }} />
        <div className="relative z-10 p-10 md:p-16 max-w-2xl animate-fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium mb-6 text-cyan-400" style={{ border: '1px solid rgba(0,229,255,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Более 105 товаров в каталоге
          </div>
          <h1 className="font-display font-black text-4xl md:text-6xl leading-tight mb-4">
            <span className="gradient-text">Будущее</span><br />уже здесь
          </h1>
          <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
            Топовая электроника с гарантией производителя.<br />Доставка по всей России за 1–3 дня.
          </p>
          <div className="flex gap-4 flex-wrap">
            <button onClick={() => onNavigate("catalog")} className="gradient-btn px-8 py-3 rounded-2xl text-base flex items-center gap-2">
              <Icon name="Zap" size={18} />Смотреть каталог
            </button>
          </div>
        </div>
        <div className="absolute right-10 top-12 glass rounded-2xl p-4 text-center animate-float hidden md:block" style={{ border: '1px solid rgba(0,229,255,0.15)' }}>
          <div className="font-display font-black text-2xl neon-text">105+</div>
          <div className="text-xs text-muted-foreground">товаров</div>
        </div>
        <div className="absolute right-10 bottom-16 glass rounded-2xl p-4 text-center animate-float hidden md:block" style={{ animationDelay: '2s', border: '1px solid rgba(155,89,245,0.2)' }}>
          <div className="font-display font-black text-2xl text-purple-400">7</div>
          <div className="text-xs text-muted-foreground">категорий</div>
        </div>
      </section>

      <section>
        <h2 className="font-display font-bold text-2xl mb-6">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { icon: "Smartphone", label: "Смартфоны" }, { icon: "Laptop", label: "Ноутбуки" },
            { icon: "Headphones", label: "Аудио" }, { icon: "Watch", label: "Носимые" },
            { icon: "Tablet", label: "Планшеты" }, { icon: "Camera", label: "Камеры" },
            { icon: "Package", label: "Аксессуары" },
          ].map((cat, i) => (
            <button key={cat.label} onClick={() => onNavigate("catalog")}
              className="glass card-hover rounded-2xl p-4 text-center space-y-2 neon-border animate-fade-up"
              style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
              <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(155,89,245,0.15))' }}>
                <Icon name={cat.icon} size={20} className="text-cyan-400" fallback="Box" />
              </div>
              <div className="text-xs font-semibold">{cat.label}</div>
            </button>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-2xl">Хиты продаж</h2>
          <button onClick={() => onNavigate("catalog")} className="text-sm flex items-center gap-1 text-cyan-400 hover:text-cyan-300 transition-colors">
            Все товары <Icon name="ArrowRight" size={14} />
          </button>
        </div>
        {featured.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <div key={i} className="glass rounded-2xl h-72 animate-pulse" />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
            {featured.slice(0, 3).map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} onNavigateProduct={onNavigateProduct} />)}
          </div>
        )}
      </section>

      {/* 3 промо-баннера */}
      <section className="grid md:grid-cols-3 gap-4">
        {/* Баннер 1 — ноутбуки */}
        <div className="relative rounded-3xl overflow-hidden md:col-span-1">
          <img src={CATALOG_IMG} alt="Ноутбуки" className="w-full h-48 object-cover opacity-30" />
          <div className="absolute inset-0 flex flex-col justify-end p-6" style={{ background: 'linear-gradient(0deg, rgba(8,12,20,0.95) 0%, rgba(8,12,20,0.4) 100%)' }}>
            <div className="text-xs font-bold mb-1 uppercase tracking-widest text-pink-400">−30%</div>
            <h3 className="font-display font-black text-xl mb-3">Скидки<br />на ноутбуки</h3>
            <button onClick={() => onNavigate("catalog")} className="gradient-btn px-4 py-2 rounded-xl text-xs w-fit">Смотреть</button>
          </div>
        </div>

        {/* Баннер 2 — наушники */}
        <div className="relative rounded-3xl overflow-hidden md:col-span-1" style={{ background: 'linear-gradient(135deg, rgba(155,89,245,0.15), rgba(8,12,20,0.9))' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(155,89,245,0.2) 0%, rgba(8,12,20,0.95) 70%)' }} />
          <img src={HERO_IMG} alt="Аудио" className="w-full h-48 object-cover opacity-20" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <div className="text-xs font-bold mb-1 uppercase tracking-widest text-purple-400">Новинки</div>
            <h3 className="font-display font-black text-xl mb-3">Аудио<br />от Sony & Bose</h3>
            <button onClick={() => onNavigate("catalog")} className="px-4 py-2 rounded-xl text-xs w-fit font-bold text-[#080c14]" style={{ background: 'linear-gradient(135deg, #9b59f5, #6d28d9)' }}>Слушать</button>
          </div>
        </div>

        {/* Баннер 3 — рассрочка */}
        <div className="relative rounded-3xl overflow-hidden md:col-span-1" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(8,12,20,0.95))' }}>
          <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15) 0%, rgba(8,12,20,0.95) 60%)' }} />
          <img src={GADGETS_IMG} alt="Рассрочка" className="w-full h-48 object-cover opacity-20" />
          <div className="absolute inset-0 flex flex-col justify-end p-6">
            <div className="text-xs font-bold mb-1 uppercase tracking-widest text-cyan-400">Специально</div>
            <h3 className="font-display font-black text-xl mb-1">Рассрочка<br />0% на 12 мес.</h3>
            <p className="text-xs text-muted-foreground mb-3">На все смартфоны и планшеты</p>
            <button onClick={() => onNavigate("catalog")} className="gradient-btn px-4 py-2 rounded-xl text-xs w-fit">Оформить</button>
          </div>
        </div>
      </section>

      {/* Таймер акции */}
      <section className="glass rounded-3xl neon-border overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="p-8 md:p-10 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-orange-400 mb-3">
              <Icon name="Flame" size={14} fallback="Zap" />Горячая распродажа
            </div>
            <h3 className="font-display font-black text-2xl md:text-3xl mb-2">Гаджеты<br /><span className="gradient-text">со скидкой до 40%</span></h3>
            <p className="text-muted-foreground text-sm mb-6">Носимые устройства, аксессуары и камеры. Только сегодня и завтра!</p>
            <button onClick={() => onNavigate("catalog")} className="gradient-btn px-6 py-3 rounded-2xl text-sm w-fit flex items-center gap-2">
              <Icon name="Zap" size={16} />Забрать скидку
            </button>
          </div>
          <div className="relative hidden md:flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at center, rgba(255,107,43,0.15) 0%, transparent 70%)' }} />
            <div className="grid grid-cols-2 gap-3 relative z-10">
              {[
                { label: "Часов", value: "23" }, { label: "Минут", value: "47" },
                { label: "Секунд", value: "12" }, { label: "Товаров", value: "40+" },
              ].map(t => (
                <div key={t.label} className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid rgba(255,107,43,0.2)' }}>
                  <div className="font-display font-black text-2xl text-orange-400">{t.value}</div>
                  <div className="text-xs text-muted-foreground">{t.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: "Truck", label: "Быстрая доставка", value: "1–3 дня" },
          { icon: "Shield", label: "Официальная гарантия", value: "до 3 лет" },
          { icon: "RotateCcw", label: "Возврат товара", value: "14 дней" },
          { icon: "Headset", label: "Поддержка 24/7", value: "всегда" },
        ].map(s => (
          <div key={s.label} className="glass rounded-2xl p-5 flex items-center gap-4 neon-border">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(155,89,245,0.1))' }}>
              <Icon name={s.icon} size={20} className="text-cyan-400" fallback="Star" />
            </div>
            <div>
              <div className="text-sm font-semibold">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}

function CatalogPage({ onAddToCart, onNavigateProduct }: { onAddToCart: (p: Product) => void; onNavigateProduct: (id: number) => void }) {
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

function CartPage({ cart, onUpdate, onNavigate }: { cart: CartItem[]; onUpdate: (cart: CartItem[]) => void; onNavigate: (p: Page) => void }) {
  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);
  if (cart.length === 0) {
    return (
      <div className="text-center py-32 animate-fade-up">
        <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.1), rgba(155,89,245,0.1))' }}>
          <Icon name="ShoppingCart" size={36} className="text-muted-foreground" />
        </div>
        <h2 className="font-display font-bold text-2xl mb-2">Корзина пуста</h2>
        <p className="text-muted-foreground mb-6">Добавьте товары из каталога</p>
        <button onClick={() => onNavigate("catalog")} className="gradient-btn px-8 py-3 rounded-2xl">В каталог</button>
      </div>
    );
  }
  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h2 className="font-display font-bold text-2xl mb-6">Корзина <span className="text-muted-foreground text-base font-normal">({cart.length})</span></h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {cart.map((p, idx) => (
            <div key={`${p.id}-${idx}`} className="glass rounded-2xl p-4 neon-border flex gap-4 items-center card-hover">
              <img src={p.img_url || GADGETS_IMG} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.brand}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => { const nc = [...cart]; nc[idx] = { ...nc[idx], quantity: Math.max(1, nc[idx].quantity - 1) }; onUpdate(nc); }}
                  className="glass w-7 h-7 rounded-lg flex items-center justify-center text-sm">−</button>
                <span className="w-6 text-center text-sm font-medium">{p.quantity}</span>
                <button onClick={() => { const nc = [...cart]; nc[idx] = { ...nc[idx], quantity: nc[idx].quantity + 1 }; onUpdate(nc); }}
                  className="glass w-7 h-7 rounded-lg flex items-center justify-center text-sm">+</button>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-cyan-400">{(p.price * p.quantity).toLocaleString('ru-RU')} ₽</div>
                <button onClick={() => onUpdate(cart.filter((_, i) => i !== idx))} className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">Удалить</button>
              </div>
            </div>
          ))}
        </div>
        <div className="glass rounded-2xl p-5 neon-border h-fit sticky top-24 space-y-4">
          <h3 className="font-display font-bold text-base">Итого</h3>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Товары</span><span>{total.toLocaleString('ru-RU')} ₽</span></div>
          <div className="flex justify-between text-sm"><span className="text-muted-foreground">Доставка</span><span className="text-emerald-400">Бесплатно</span></div>
          <div className="border-t border-border pt-3">
            <div className="flex justify-between font-bold text-lg"><span>Сумма</span><span className="text-cyan-400">{total.toLocaleString('ru-RU')} ₽</span></div>
          </div>
          <button onClick={() => onNavigate("checkout")} className="gradient-btn w-full py-3 rounded-xl text-base font-bold flex items-center justify-center gap-2">
            <Icon name="CreditCard" size={16} />Оформить заказ
          </button>
          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground"><Icon name="Shield" size={12} />Безопасная оплата</div>
        </div>
      </div>
    </div>
  );
}

function CheckoutPage({ cart, token, user, onSuccess, onNavigate }: {
  cart: CartItem[]; token: string; user: User | null; onSuccess: (id: number) => void; onNavigate: (p: Page) => void;
}) {
  const [form, setForm] = useState({ first_name: user?.first_name || "", last_name: user?.last_name || "", phone: "", email: user?.email || "", address: "", city: "Москва", delivery: "courier", payment: "card", comment: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const total = cart.reduce((s, p) => s + p.price * p.quantity, 0);

  const handleSubmit = async () => {
    if (!form.first_name || !form.address || !form.phone) { setError("Заполните обязательные поля: имя, телефон, адрес"); return; }
    setLoading(true); setError("");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const r = await fetch(`${API_AUTH_ORDERS}?section=orders`, {
      method: "POST", headers,
      body: JSON.stringify({ items: cart.map(p => ({ product_id: p.id, quantity: p.quantity, price: p.price })), delivery_address: `${form.city}, ${form.address}`, delivery_method: form.delivery, payment_method: form.payment, comment: form.comment })
    }).catch(() => null);
    setLoading(false);
    if (r?.ok) { const d = await r.json(); onSuccess(d.order_id); }
    else setError("Ошибка при оформлении. Попробуйте ещё раз.");
  };

  return (
    <div className="max-w-4xl mx-auto animate-fade-up">
      <h2 className="font-display font-bold text-2xl mb-6 flex items-center gap-2">
        <button onClick={() => onNavigate("cart")} className="text-muted-foreground hover:text-white transition-colors"><Icon name="ArrowLeft" size={20} /></button>
        Оформление заказа
      </h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <div className="glass rounded-2xl p-5 neon-border space-y-4">
            <h3 className="font-display font-bold text-base">Контактные данные</h3>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Имя *</label><input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Фамилия</label><input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Телефон *</label><input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+7 (999) 000-00-00" className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Email</label><input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" /></div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 neon-border space-y-4">
            <h3 className="font-display font-bold text-base">Доставка</h3>
            <div className="grid grid-cols-2 gap-3">
              {[{ val: "courier", label: "Курьер", icon: "Truck", sub: "1–3 дня" }, { val: "pickup", label: "Самовывоз", icon: "MapPin", sub: "сегодня" }].map(d => (
                <button key={d.val} onClick={() => setForm(f => ({ ...f, delivery: d.val }))}
                  className="rounded-xl p-4 text-left transition-all glass hover:border-white/20"
                  style={form.delivery === d.val ? { borderColor: 'rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.3)' } : {}}>
                  <Icon name={d.icon} size={16} className={form.delivery === d.val ? "text-cyan-400" : "text-muted-foreground"} fallback="Truck" />
                  <div className="text-sm font-medium mt-2">{d.label}</div>
                  <div className="text-xs text-muted-foreground">{d.sub}</div>
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="text-xs text-muted-foreground mb-1 block">Город</label><input value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" /></div>
              <div><label className="text-xs text-muted-foreground mb-1 block">Адрес *</label><input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="ул. Примерная, д.1" className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" /></div>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 neon-border space-y-4">
            <h3 className="font-display font-bold text-base">Оплата</h3>
            <div className="grid grid-cols-3 gap-3">
              {[{ val: "card", label: "Карта", icon: "CreditCard" }, { val: "sbp", label: "СБП", icon: "Smartphone" }, { val: "cash", label: "Наличные", icon: "Banknote" }].map(p => (
                <button key={p.val} onClick={() => setForm(f => ({ ...f, payment: p.val }))}
                  className="rounded-xl p-4 text-center transition-all glass"
                  style={form.payment === p.val ? { borderColor: 'rgba(0,229,255,0.3)', background: 'rgba(0,229,255,0.05)', border: '1px solid rgba(0,229,255,0.3)' } : {}}>
                  <Icon name={p.icon} size={18} className={`mx-auto mb-1 ${form.payment === p.val ? "text-cyan-400" : "text-muted-foreground"}`} fallback="CreditCard" />
                  <div className="text-xs font-medium">{p.label}</div>
                </button>
              ))}
            </div>
            <textarea value={form.comment} onChange={e => setForm(f => ({ ...f, comment: e.target.value }))} rows={2} placeholder="Комментарий к заказу..." className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all resize-none" />
          </div>
          {error && <div className="glass rounded-xl p-3 border border-red-500/30 text-red-400 text-sm">{error}</div>}
        </div>

        <div>
          <div className="glass rounded-2xl p-5 neon-border sticky top-24 space-y-4">
            <h3 className="font-display font-bold text-base">Ваш заказ</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto scrollbar-hide">
              {cart.map((p, i) => <div key={i} className="flex justify-between text-sm gap-2"><span className="text-muted-foreground truncate">{p.name} ×{p.quantity}</span><span className="shrink-0">{(p.price * p.quantity).toLocaleString('ru-RU')} ₽</span></div>)}
            </div>
            <div className="border-t border-border pt-3">
              <div className="flex justify-between text-sm mb-1"><span className="text-muted-foreground">Доставка</span><span className="text-emerald-400">Бесплатно</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Итого</span><span className="text-cyan-400">{total.toLocaleString('ru-RU')} ₽</span></div>
            </div>
            <button onClick={handleSubmit} disabled={loading} className="gradient-btn w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 disabled:opacity-60">
              {loading ? "Оформляем..." : <><Icon name="Check" size={16} />Подтвердить заказ</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function OrderSuccessPage({ orderId, onNavigate }: { orderId: number; onNavigate: (p: Page) => void }) {
  return (
    <div className="text-center py-24 animate-fade-up max-w-lg mx-auto">
      <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center animate-pulse-glow" style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' }}>
        <Icon name="Check" size={40} className="text-[#080c14]" />
      </div>
      <h2 className="font-display font-black text-3xl mb-3 gradient-text">Заказ оформлен!</h2>
      <p className="text-muted-foreground mb-2">Заказ #{orderId} успешно создан</p>
      <p className="text-muted-foreground text-sm mb-8">Мы свяжемся с вами в ближайшее время для подтверждения.</p>
      <div className="flex gap-3 justify-center">
        <button onClick={() => onNavigate("orders")} className="gradient-btn px-6 py-3 rounded-2xl flex items-center gap-2"><Icon name="Package" size={16} />Мои заказы</button>
        <button onClick={() => onNavigate("home")} className="glass px-6 py-3 rounded-2xl hover:border-cyan-400/30 transition-all">На главную</button>
      </div>
    </div>
  );
}

function OrdersPage({ token, user, onNavigate }: { token: string; user: User | null; onNavigate: (p: Page) => void }) {
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

function AuthPage({ onLogin, onRegister }: { onLogin: (e: string, p: string) => Promise<{ ok: boolean; error?: string }>; onRegister: (d: any) => Promise<{ ok: boolean; error?: string }> }) {
  const [tab, setTab] = useState<"login" | "register">("login");
  const [form, setForm] = useState({ email: "", password: "", first_name: "", last_name: "", phone: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    setError(""); setLoading(true);
    if (tab === "login") {
      const r = await onLogin(form.email, form.password);
      if (!r.ok) setError(r.error === "invalid credentials" ? "Неверный email или пароль" : r.error || "Ошибка");
    } else {
      if (!form.first_name) { setError("Введите имя"); setLoading(false); return; }
      const r = await onRegister(form);
      if (!r.ok) setError(r.error === "email already exists" ? "Такой email уже зарегистрирован" : r.error || "Ошибка");
    }
    setLoading(false);
  };

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="glass rounded-3xl p-8 neon-border w-full max-w-md animate-scale-in">
        <div className="text-center mb-6">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center font-display font-black text-xl" style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>TV</div>
          <h2 className="font-display font-bold text-xl">TechVolt</h2>
          <p className="text-muted-foreground text-sm">Личный кабинет</p>
        </div>
        <div className="flex rounded-xl glass p-1 mb-6">
          {(["login", "register"] as const).map(t => (
            <button key={t} onClick={() => { setTab(t); setError(""); }} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? 'text-[#080c14]' : 'text-muted-foreground'}`} style={tab === t ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
              {t === "login" ? "Войти" : "Регистрация"}
            </button>
          ))}
        </div>
        <div className="space-y-3">
          {tab === "register" && (
            <div className="grid grid-cols-2 gap-3">
              <input placeholder="Имя *" value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} className="glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
              <input placeholder="Фамилия" value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} className="glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
            </div>
          )}
          <input type="email" placeholder="Email *" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} onKeyDown={e => e.key === "Enter" && handle()} className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
          {tab === "register" && <input placeholder="Телефон" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />}
          <input type="password" placeholder="Пароль *" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} onKeyDown={e => e.key === "Enter" && handle()} className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
          {error && <div className="glass rounded-xl p-3 border border-red-500/30 text-red-400 text-sm">{error}</div>}
          <button onClick={handle} disabled={loading} className="gradient-btn w-full py-3 rounded-xl font-bold text-sm disabled:opacity-60">
            {loading ? "..." : tab === "login" ? "Войти в аккаунт" : "Создать аккаунт"}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ user, onLogout, onNavigate }: { user: User | null; onLogout: () => void; onNavigate: (p: Page) => void }) {
  if (!user) return (
    <div className="text-center py-24">
      <Icon name="User" size={40} className="mx-auto mb-4 text-muted-foreground opacity-40" />
      <h2 className="font-display font-bold text-xl mb-2">Войдите в аккаунт</h2>
      <button onClick={() => onNavigate("auth")} className="gradient-btn px-8 py-3 rounded-2xl mt-4">Войти / Зарегистрироваться</button>
    </div>
  );
  const initials = `${user.first_name?.[0] || ""}${user.last_name?.[0] || ""}`.toUpperCase() || user.email[0].toUpperCase();
  return (
    <div className="max-w-2xl mx-auto">
      <div className="glass rounded-3xl p-8 neon-border text-center mb-6">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-display font-black text-2xl" style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>{initials}</div>
        <h2 className="font-display font-bold text-xl">{user.first_name} {user.last_name}</h2>
        <p className="text-muted-foreground text-sm">{user.email}</p>
        {user.role === "admin" && <span className="inline-block mt-2 text-xs px-3 py-1 rounded-full font-medium text-purple-300 bg-purple-400/10">Администратор</span>}
      </div>
      <div className="space-y-3">
        {[
          { icon: "Package", label: "Мои заказы", action: () => onNavigate("orders") },
          ...(user.role === "admin" ? [{ icon: "LayoutDashboard", label: "Панель администратора", action: () => onNavigate("admin") }] : []),
          { icon: "LogOut", label: "Выйти из аккаунта", action: onLogout, danger: true },
        ].map((item: any) => (
          <button key={item.label} onClick={item.action} className="glass w-full rounded-xl p-4 neon-border flex items-center justify-between card-hover group">
            <div className="flex items-center gap-3">
              <Icon name={item.icon} size={18} className={item.danger ? "text-red-400" : "text-cyan-400"} fallback="Settings" />
              <span className={`text-sm font-medium ${item.danger ? "text-red-400" : ""}`}>{item.label}</span>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
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

function AdminProductsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
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

function AdminCustomersPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
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

function AdminAnalyticsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
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

function ContactsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="font-display font-bold text-2xl">Контакты</h2>
      <div className="grid sm:grid-cols-2 gap-4">
        {[
          { icon: "Phone", label: "Телефон", value: "+7 (800) 555-01-23", sub: "Бесплатно по России" },
          { icon: "Mail", label: "Email", value: "help@techvolt.ru", sub: "Отвечаем за 1 час" },
          { icon: "MapPin", label: "Адрес", value: "Москва, ул. Технологическая, 14", sub: "Пн–Вс: 10:00–21:00" },
          { icon: "MessageSquare", label: "Telegram", value: "@techvolt_support", sub: "Онлайн поддержка" },
        ].map(c => (
          <div key={c.label} className="glass rounded-2xl p-5 neon-border card-hover">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(155,89,245,0.15))' }}>
              <Icon name={c.icon} size={20} className="text-cyan-400" fallback="Info" />
            </div>
            <div className="text-xs text-muted-foreground mb-1">{c.label}</div>
            <div className="font-semibold text-sm">{c.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{c.sub}</div>
          </div>
        ))}
      </div>
      <div className="glass rounded-2xl p-6 neon-border">
        <h3 className="font-display font-bold text-base mb-4">Написать нам</h3>
        <div className="space-y-3">
          <input placeholder="Ваше имя" className="w-full glass rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
          <input placeholder="Email" className="w-full glass rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
          <textarea placeholder="Сообщение..." rows={4} className="w-full glass rounded-xl px-4 py-3 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all resize-none" />
          <button className="gradient-btn w-full py-3 rounded-xl font-bold">Отправить</button>
        </div>
      </div>
    </div>
  );
}

// ============ MAIN APP ============
const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "catalog", label: "Каталог", icon: "Grid3X3" },
  { id: "cart", label: "Корзина", icon: "ShoppingCart" },
  { id: "orders", label: "Заказы", icon: "Package" },
  { id: "contacts", label: "Контакты", icon: "MessageSquare" },
];

export default function App() {
  const { user, token, loading: authLoading, login, register, logout } = useAuth();
  const [page, setPage] = useState<Page>("home");
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastOrderId, setLastOrderId] = useState<number | null>(null);

  const addToCart = (p: Product) => {
    setCart(prev => {
      const idx = prev.findIndex(c => c.id === p.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = { ...n[idx], quantity: n[idx].quantity + 1 }; return n; }
      return [...prev, { ...p, quantity: 1 }];
    });
  };

  const navigate = (p: Page) => { setPage(p); setMobileMenuOpen(false); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const navigateProduct = (id: number) => { setCurrentProductId(id); setPage("product"); window.scrollTo({ top: 0, behavior: 'smooth' }); };
  const cartCount = cart.reduce((s, p) => s + p.quantity, 0);

  if (authLoading) return <div className="min-h-screen flex items-center justify-center"><div className="text-muted-foreground animate-pulse">Загрузка...</div></div>;

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-50 glass-bright border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => navigate("home")} className="flex items-center gap-2 font-display font-black text-xl">
              <span className="gradient-text">TechVolt</span>
              <span className="w-2 h-2 rounded-full animate-pulse bg-cyan-400" />
            </button>

            <nav className="hidden md:flex items-center gap-1">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 relative ${page === item.id ? 'text-[#080c14]' : 'text-muted-foreground hover:text-white'}`}
                  style={page === item.id ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  <Icon name={item.icon} size={14} fallback="Circle" />
                  {item.label}
                  {item.id === "cart" && cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold bg-pink-500 text-white">{cartCount}</span>
                  )}
                </button>
              ))}
              {user ? (
                <button onClick={() => navigate("profile")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${(page === "profile" || page.startsWith("admin")) ? 'text-[#080c14]' : 'text-muted-foreground hover:text-white'}`}
                  style={(page === "profile" || page.startsWith("admin")) ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold" style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>
                    {(user.first_name?.[0] || user.email[0]).toUpperCase()}
                  </span>
                  {user.first_name || "Профиль"}
                </button>
              ) : (
                <button onClick={() => navigate("auth")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${page === "auth" ? 'text-[#080c14]' : 'text-muted-foreground hover:text-white'}`}
                  style={page === "auth" ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  <Icon name="User" size={14} />Войти
                </button>
              )}
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => navigate("cart")} className="relative p-2">
                <Icon name="ShoppingCart" size={20} />
                {cartCount > 0 && <span className="absolute top-0 right-0 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold bg-pink-500 text-white">{cartCount}</span>}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-white/5 animate-fade-up">
              {[...NAV_ITEMS, ...(user ? [{ id: "profile" as Page, label: user.first_name || "Профиль", icon: "User" }] : [{ id: "auth" as Page, label: "Войти", icon: "User" }])].map(item => (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${page === item.id ? 'text-[#080c14]' : 'text-muted-foreground'}`}
                  style={page === item.id ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  <Icon name={item.icon} size={16} fallback="Circle" />
                  {item.label}
                  {item.id === "cart" && cartCount > 0 && <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500 text-white">{cartCount}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === "home" && !lastOrderId && <HomePage onNavigate={navigate} onAddToCart={addToCart} onNavigateProduct={navigateProduct} />}
        {page === "home" && lastOrderId && <OrderSuccessPage orderId={lastOrderId} onNavigate={(p) => { setLastOrderId(null); navigate(p); }} />}
        {page === "product" && currentProductId && <ProductPage productId={currentProductId} onNavigate={navigate} onAddToCart={addToCart} />}
        {page === "catalog" && <CatalogPage onAddToCart={addToCart} onNavigateProduct={navigateProduct} />}
        {page === "cart" && <CartPage cart={cart} onUpdate={setCart} onNavigate={navigate} />}
        {page === "checkout" && <CheckoutPage cart={cart} token={token} user={user} onSuccess={(id) => { setLastOrderId(id); setCart([]); navigate("home"); }} onNavigate={navigate} />}
        {page === "orders" && <OrdersPage token={token} user={user} onNavigate={navigate} />}
        {page === "profile" && <ProfilePage user={user} onLogout={() => { logout(); navigate("home"); }} onNavigate={navigate} />}
        {page === "auth" && <AuthPage onLogin={async (e, p) => { const r = await login(e, p); if (r.ok) navigate("profile"); return r; }} onRegister={async (d) => { const r = await register(d); if (r.ok) navigate("profile"); return r; }} />}
        {page === "admin" && <AdminPage onNavigate={navigate} />}
        {page === "admin-products" && <AdminProductsPage onNavigate={navigate} />}
        {page === "admin-customers" && <AdminCustomersPage onNavigate={navigate} />}
        {page === "admin-analytics" && <AdminAnalyticsPage onNavigate={navigate} />}
        {page === "contacts" && <ContactsPage />}
      </main>

      <footer className="glass-bright border-t border-white/5 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-black gradient-text text-lg">TechVolt</div>
          <div className="text-xs text-muted-foreground">© 2026 TechVolt. Все права защищены.</div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate("contacts")} className="hover:text-white transition-colors">Контакты</button>
            <button className="hover:text-white transition-colors">Политика конфиденциальности</button>
          </div>
        </div>
      </footer>
    </div>
  );
}