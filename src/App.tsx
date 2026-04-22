import { useState } from "react";
import Icon from "@/components/ui/icon";

const HERO_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/f0874d31-46a3-403a-b8d9-a111da942884.jpg";
const CATALOG_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/0b1b6e37-0a99-4e72-bdfc-19102cac72b2.jpg";
const GADGETS_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/2b3f9fd8-0496-43f6-99e6-6d644bf3dcd6.jpg";

type Page = "home" | "catalog" | "cart" | "orders" | "profile" | "admin" | "contacts";

const PRODUCTS = [
  { id: 1, name: "Смартфон Nova X15 Pro", brand: "Nova", price: 89990, oldPrice: 109990, rating: 4.8, reviews: 312, power: "5000 мАч", warranty: "2 года", category: "Смартфоны", badge: "Хит", img: GADGETS_IMG },
  { id: 2, name: "Ноутбук TechBook Ultra", brand: "TechBook", price: 149990, oldPrice: null as null | number, rating: 4.9, reviews: 178, power: "65W", warranty: "3 года", category: "Ноутбуки", badge: "Новинка", img: CATALOG_IMG },
  { id: 3, name: "Наушники SoundPro X", brand: "SoundPro", price: 24990, oldPrice: 31990 as null | number, rating: 4.7, reviews: 524, power: "30 ч", warranty: "1 год", category: "Аудио", badge: null as null | string, img: HERO_IMG },
  { id: 4, name: "Смарт-часы VoltWatch 4", brand: "Volt", price: 34990, oldPrice: 39990 as null | number, rating: 4.6, reviews: 201, power: "7 дней", warranty: "2 года", category: "Носимые", badge: "Скидка" as null | string, img: GADGETS_IMG },
  { id: 5, name: "Планшет TabPro 12", brand: "TechBook", price: 64990, oldPrice: null as null | number, rating: 4.8, reviews: 89, power: "10000 мАч", warranty: "2 года", category: "Планшеты", badge: null as null | string, img: CATALOG_IMG },
  { id: 6, name: "Power Bank UltraCharge", brand: "Volt", price: 4990, oldPrice: 6990 as null | number, rating: 4.5, reviews: 1042, power: "20000 мАч", warranty: "1 год", category: "Аксессуары", badge: "Топ" as null | string, img: HERO_IMG },
];

type Product = typeof PRODUCTS[0];

const ORDERS = [
  { id: "#TV-00421", date: "18 апр 2026", status: "Доставлен", total: 89990, items: 1 },
  { id: "#TV-00387", date: "05 апр 2026", status: "В пути", total: 149990, items: 2 },
  { id: "#TV-00312", date: "22 мар 2026", status: "Доставлен", total: 24990, items: 1 },
];

const STATUS_COLORS: Record<string, string> = {
  "Доставлен": "text-emerald-400 bg-emerald-400/10",
  "В пути": "text-cyan-400 bg-cyan-400/10",
  "Отменён": "text-red-400 bg-red-400/10",
  "Обрабатывается": "text-yellow-400 bg-yellow-400/10",
};

const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "catalog", label: "Каталог", icon: "Grid3X3" },
  { id: "cart", label: "Корзина", icon: "ShoppingCart" },
  { id: "orders", label: "Заказы", icon: "Package" },
  { id: "profile", label: "Профиль", icon: "User" },
  { id: "admin", label: "Админ", icon: "Settings" },
  { id: "contacts", label: "Контакты", icon: "MessageSquare" },
];

const CATEGORIES = ["Все", "Смартфоны", "Ноутбуки", "Аудио", "Носимые", "Планшеты", "Аксессуары"];
const BRANDS = ["Все", "Nova", "TechBook", "SoundPro", "Volt"];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.floor(rating) ? "text-yellow-400" : "text-gray-600"} style={{ fontSize: 12 }}>★</span>
      ))}
    </div>
  );
}

function ProductCard({ product, onAddToCart }: { product: Product; onAddToCart: (p: Product) => void }) {
  return (
    <div className="glass card-hover rounded-2xl overflow-hidden neon-border group cursor-pointer">
      <div className="relative h-44 overflow-hidden">
        <img src={product.img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent" />
        {product.badge && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>
            {product.badge}
          </span>
        )}
        <button className="absolute top-3 right-3 w-8 h-8 rounded-full glass flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <Icon name="Heart" size={14} className="text-pink-400" />
        </button>
      </div>
      <div className="p-4">
        <div className="text-xs text-muted-foreground mb-1">{product.brand} · {product.category}</div>
        <div className="font-semibold text-sm leading-tight mb-2 text-white">{product.name}</div>
        <div className="flex items-center gap-2 mb-3">
          <StarRating rating={product.rating} />
          <span className="text-xs text-muted-foreground">{product.reviews}</span>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mb-3">
          <span className="flex items-center gap-1"><Icon name="Zap" size={10} className="text-cyan-400" />{product.power}</span>
          <span className="flex items-center gap-1"><Icon name="Shield" size={10} className="text-purple-400" />{product.warranty}</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-lg font-bold text-cyan-400">{product.price.toLocaleString('ru-RU')} ₽</div>
            {product.oldPrice && <div className="text-xs text-muted-foreground line-through">{product.oldPrice.toLocaleString('ru-RU')} ₽</div>}
          </div>
          <button onClick={() => onAddToCart(product)} className="gradient-btn px-3 py-2 rounded-xl text-sm flex items-center gap-1">
            <Icon name="Plus" size={14} />В корзину
          </button>
        </div>
      </div>
    </div>
  );
}

function HomePage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="space-y-16">
      <section className="relative rounded-3xl overflow-hidden min-h-[480px] flex items-center">
        <img src={HERO_IMG} alt="Hero" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(8,12,20,0.95) 0%, rgba(8,12,20,0.6) 60%, transparent 100%)' }} />
        <div className="relative z-10 p-10 md:p-16 max-w-2xl animate-fade-up">
          <div className="inline-flex items-center gap-2 glass px-4 py-2 rounded-full text-xs font-medium mb-6 text-cyan-400" style={{ border: '1px solid rgba(0,229,255,0.2)' }}>
            <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
            Новые поступления 2026
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
            <button className="glass px-8 py-3 rounded-2xl text-base flex items-center gap-2 transition-all hover:border-cyan-400/30" style={{ border: '1px solid rgba(255,255,255,0.1)' }}>
              <Icon name="Play" size={18} className="text-cyan-400" />О магазине
            </button>
          </div>
        </div>
        <div className="absolute right-10 top-12 glass rounded-2xl p-4 text-center animate-float hidden md:block" style={{ border: '1px solid rgba(0,229,255,0.15)' }}>
          <div className="font-display font-black text-2xl neon-text">10K+</div>
          <div className="text-xs text-muted-foreground">клиентов</div>
        </div>
        <div className="absolute right-10 bottom-16 glass rounded-2xl p-4 text-center animate-float hidden md:block" style={{ animationDelay: '2s', border: '1px solid rgba(155,89,245,0.2)' }}>
          <div className="font-display font-black text-2xl text-purple-400">500+</div>
          <div className="text-xs text-muted-foreground">товаров</div>
        </div>
      </section>

      <section>
        <h2 className="font-display font-bold text-2xl mb-6">Категории</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { icon: "Smartphone", label: "Смартфоны", count: "120+" },
            { icon: "Laptop", label: "Ноутбуки", count: "85+" },
            { icon: "Headphones", label: "Аудио", count: "200+" },
            { icon: "Watch", label: "Носимые", count: "60+" },
            { icon: "Tablet", label: "Планшеты", count: "45+" },
            { icon: "Camera", label: "Камеры", count: "30+" },
            { icon: "Gamepad2", label: "Игры", count: "90+" },
          ].map((cat, i) => (
            <button key={cat.label} onClick={() => onNavigate("catalog")}
              className="glass card-hover rounded-2xl p-4 text-center space-y-2 neon-border animate-fade-up"
              style={{ animationDelay: `${i * 0.07}s`, opacity: 0 }}>
              <div className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(155,89,245,0.15))' }}>
                <Icon name={cat.icon} size={20} className="text-cyan-400" fallback="Box" />
              </div>
              <div className="text-xs font-semibold">{cat.label}</div>
              <div className="text-xs text-muted-foreground">{cat.count}</div>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {PRODUCTS.slice(0, 3).map(p => (
            <ProductCard key={p.id} product={p} onAddToCart={() => { }} />
          ))}
        </div>
      </section>

      <section className="relative rounded-3xl overflow-hidden">
        <img src={CATALOG_IMG} alt="Акция" className="w-full h-48 object-cover opacity-30" />
        <div className="absolute inset-0 flex items-center px-10" style={{ background: 'linear-gradient(90deg, rgba(8,12,20,0.9) 0%, rgba(8,12,20,0.6) 100%)' }}>
          <div>
            <div className="text-xs font-bold mb-2 uppercase tracking-widest text-pink-400">Горячее предложение</div>
            <h3 className="font-display font-black text-2xl md:text-3xl mb-2">До 30% скидки<br />на ноутбуки</h3>
            <button onClick={() => onNavigate("catalog")} className="gradient-btn px-6 py-2 rounded-xl text-sm mt-2">
              Воспользоваться
            </button>
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

function CatalogPage({ onAddToCart }: { onAddToCart: (p: Product) => void }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Все");
  const [brand, setBrand] = useState("Все");
  const [maxPrice, setMaxPrice] = useState(200000);
  const [minRating, setMinRating] = useState(0);
  const [minWarranty, setMinWarranty] = useState("Все");
  const [sortBy, setSortBy] = useState("popular");

  const filtered = PRODUCTS.filter(p => {
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== "Все" && p.category !== category) return false;
    if (brand !== "Все" && p.brand !== brand) return false;
    if (p.price > maxPrice) return false;
    if (p.rating < minRating) return false;
    return true;
  }).sort((a, b) => {
    if (sortBy === "price_asc") return a.price - b.price;
    if (sortBy === "price_desc") return b.price - a.price;
    if (sortBy === "rating") return b.rating - a.rating;
    return b.reviews - a.reviews;
  });

  return (
    <div className="flex gap-6">
      <aside className="w-64 shrink-0 hidden md:block">
        <div className="glass rounded-2xl p-5 neon-border space-y-6 sticky top-24">
          <h3 className="font-display font-bold text-base">Фильтры</h3>

          <div>
            <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Производитель</div>
            <div className="space-y-1">
              {BRANDS.map(b => (
                <button key={b} onClick={() => setBrand(b)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${brand === b ? 'text-[#080c14] font-semibold' : 'text-muted-foreground hover:text-white'}`}
                  style={brand === b ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  {b}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Цена до</div>
            <input type="range" min={1000} max={200000} step={1000} value={maxPrice}
              onChange={e => setMaxPrice(+e.target.value)}
              className="w-full accent-cyan-400" />
            <div className="text-sm font-semibold mt-1 text-cyan-400">{maxPrice.toLocaleString('ru-RU')} ₽</div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Рейтинг от</div>
            <div className="flex gap-2 flex-wrap">
              {[0, 4, 4.5, 4.7].map(r => (
                <button key={r} onClick={() => setMinRating(r)}
                  className={`px-2 py-1 rounded-lg text-xs transition-all ${minRating === r ? 'gradient-btn' : 'glass text-muted-foreground hover:text-white'}`}>
                  {r === 0 ? "Все" : `${r}+`}
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="text-xs text-muted-foreground mb-2 font-medium uppercase tracking-wide">Гарантия</div>
            <div className="space-y-1">
              {["Все", "1 год", "2 года", "3 года"].map(w => (
                <button key={w} onClick={() => setMinWarranty(w)}
                  className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${minWarranty === w ? 'text-[#080c14] font-semibold' : 'text-muted-foreground hover:text-white'}`}
                  style={minWarranty === w ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  {w}
                </button>
              ))}
            </div>
          </div>

          <button onClick={() => { setBrand("Все"); setMaxPrice(200000); setMinRating(0); setMinWarranty("Все"); setCategory("Все"); }}
            className="w-full glass px-4 py-2 rounded-xl text-sm text-muted-foreground hover:text-white transition-all">
            Сбросить всё
          </button>
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="flex flex-col sm:flex-row gap-3 mb-5">
          <div className="relative flex-1">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Поиск товаров..."
              className="w-full glass rounded-xl pl-9 pr-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
          </div>
          <select value={sortBy} onChange={e => setSortBy(e.target.value)}
            className="glass rounded-xl px-4 py-2.5 text-sm outline-none cursor-pointer bg-transparent">
            <option value="popular">По популярности</option>
            <option value="price_asc">Дешевле</option>
            <option value="price_desc">Дороже</option>
            <option value="rating">По рейтингу</option>
          </select>
        </div>

        <div className="flex gap-2 mb-5 flex-wrap">
          {CATEGORIES.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-sm transition-all ${category === c ? 'text-[#080c14] font-semibold' : 'glass text-muted-foreground hover:text-white'}`}
              style={category === c ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
              {c}
            </button>
          ))}
        </div>

        <div className="text-xs text-muted-foreground mb-4">Найдено: {filtered.length} товаров</div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(p => <ProductCard key={p.id} product={p} onAddToCart={onAddToCart} />)}
          {filtered.length === 0 && (
            <div className="col-span-3 text-center py-20 text-muted-foreground">
              <Icon name="SearchX" size={48} className="mx-auto mb-4 opacity-30" fallback="Search" />
              <p>Ничего не найдено. Попробуйте изменить фильтры.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CartPage({ cart, onRemove, onNavigate }: { cart: Product[]; onRemove: (id: number) => void; onNavigate: (p: Page) => void }) {
  const total = cart.reduce((s, p) => s + p.price, 0);

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
      <h2 className="font-display font-bold text-2xl mb-6">Корзина <span className="text-muted-foreground text-base font-normal">({cart.length} товара)</span></h2>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-3">
          {cart.map((p, idx) => (
            <div key={`${p.id}-${idx}`} className="glass rounded-2xl p-4 neon-border flex gap-4 items-center card-hover">
              <img src={p.img} alt={p.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold leading-tight">{p.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{p.brand} · {p.warranty}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-cyan-400">{p.price.toLocaleString('ru-RU')} ₽</div>
                <button onClick={() => onRemove(p.id)} className="text-xs text-red-400 hover:text-red-300 mt-1 transition-colors">Удалить</button>
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
          <button className="gradient-btn w-full py-3 rounded-xl text-base font-bold">
            Оформить заказ
          </button>
          <div className="flex items-center gap-2 justify-center text-xs text-muted-foreground">
            <Icon name="Shield" size={12} />Безопасная оплата
          </div>
        </div>
      </div>
    </div>
  );
}

function OrdersPage() {
  return (
    <div className="max-w-3xl mx-auto animate-fade-up">
      <h2 className="font-display font-bold text-2xl mb-6">Мои заказы</h2>
      <div className="space-y-3">
        {ORDERS.map((order, i) => (
          <div key={order.id} className="glass rounded-2xl p-5 neon-border card-hover animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(0,229,255,0.15), rgba(155,89,245,0.15))' }}>
                  <Icon name="Package" size={18} className="text-cyan-400" />
                </div>
                <div>
                  <div className="font-bold font-display">{order.id}</div>
                  <div className="text-xs text-muted-foreground">{order.date} · {order.items} товар</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-xs px-3 py-1 rounded-full font-medium ${STATUS_COLORS[order.status] ?? ''}`}>{order.status}</span>
                <div className="font-bold text-cyan-400">{order.total.toLocaleString('ru-RU')} ₽</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ProfilePage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-up">
      <div className="glass rounded-3xl p-8 neon-border text-center mb-6">
        <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center font-display font-black text-2xl"
          style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>
          АИ
        </div>
        <h2 className="font-display font-bold text-xl">Алексей Иванов</h2>
        <p className="text-muted-foreground text-sm">alex@email.com</p>
        <div className="flex justify-center gap-6 mt-4">
          <div className="text-center"><div className="font-bold text-lg text-cyan-400">3</div><div className="text-xs text-muted-foreground">заказа</div></div>
          <div className="text-center"><div className="font-bold text-lg text-purple-400">5</div><div className="text-xs text-muted-foreground">в избранном</div></div>
          <div className="text-center"><div className="font-bold text-lg text-yellow-400">4.9</div><div className="text-xs text-muted-foreground">рейтинг</div></div>
        </div>
      </div>
      <div className="space-y-3">
        {[
          { icon: "User", label: "Личные данные" },
          { icon: "MapPin", label: "Адреса доставки" },
          { icon: "CreditCard", label: "Способы оплаты" },
          { icon: "Bell", label: "Уведомления" },
          { icon: "Lock", label: "Безопасность" },
          { icon: "LogOut", label: "Выйти из аккаунта" },
        ].map(item => (
          <button key={item.label} className="glass w-full rounded-xl p-4 neon-border flex items-center justify-between card-hover group">
            <div className="flex items-center gap-3">
              <Icon name={item.icon} size={18} className={item.label === "Выйти из аккаунта" ? "text-red-400" : "text-cyan-400"} fallback="Settings" />
              <span className={`text-sm font-medium ${item.label === "Выйти из аккаунта" ? "text-red-400" : ""}`}>{item.label}</span>
            </div>
            <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-white transition-colors" />
          </button>
        ))}
      </div>
    </div>
  );
}

function AdminPage() {
  const stats = [
    { icon: "TrendingUp", label: "Выручка за месяц", value: "1 847 990 ₽", delta: "+12%", color: '#00e5ff' },
    { icon: "ShoppingBag", label: "Заказов", value: "342", delta: "+8%", color: '#9b59f5' },
    { icon: "Users", label: "Новых клиентов", value: "118", delta: "+23%", color: '#ff2d78' },
    { icon: "Package", label: "Товаров", value: "527", delta: "+5%", color: '#ff6b2b' },
  ];
  return (
    <div className="animate-fade-up space-y-6">
      <h2 className="font-display font-bold text-2xl">Панель администратора</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <div key={s.label} className="glass rounded-2xl p-5 neon-border animate-fade-up" style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}>
            <div className="flex items-center justify-between mb-3">
              <Icon name={s.icon} size={20} style={{ color: s.color }} fallback="BarChart2" />
              <span className="text-xs text-emerald-400 font-medium">{s.delta}</span>
            </div>
            <div className="font-display font-black text-xl" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-5">
        <div className="glass rounded-2xl p-5 neon-border">
          <h3 className="font-display font-bold text-base mb-4">Последние заказы</h3>
          <div className="space-y-3">
            {ORDERS.map(o => (
              <div key={o.id} className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">{o.id}</div>
                  <div className="text-xs text-muted-foreground">{o.date}</div>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full ${STATUS_COLORS[o.status] ?? ''}`}>{o.status}</span>
                <div className="text-sm font-bold text-cyan-400">{o.total.toLocaleString('ru-RU')} ₽</div>
              </div>
            ))}
          </div>
        </div>
        <div className="glass rounded-2xl p-5 neon-border">
          <h3 className="font-display font-bold text-base mb-4">Управление</h3>
          <div className="space-y-2">
            {[
              { icon: "Plus", label: "Добавить товар" },
              { icon: "Edit", label: "Редактировать каталог" },
              { icon: "Tag", label: "Управление акциями" },
              { icon: "Users", label: "Клиенты" },
              { icon: "BarChart2", label: "Отчёты и аналитика" },
            ].map(a => (
              <button key={a.label} className="w-full glass rounded-xl px-4 py-3 text-sm flex items-center gap-3 hover:border-cyan-400/30 transition-all text-left group">
                <Icon name={a.icon} size={16} className="text-cyan-400" fallback="Settings" />
                {a.label}
                <Icon name="ChevronRight" size={14} className="ml-auto text-muted-foreground group-hover:text-white transition-colors" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactsPage() {
  return (
    <div className="max-w-2xl mx-auto animate-fade-up space-y-6">
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

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [cart, setCart] = useState<Product[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const addToCart = (p: Product) => setCart(prev => [...prev, p]);
  const removeFromCart = (id: number) => setCart(prev => {
    const idx = [...prev].reverse().findIndex(p => p.id === id);
    if (idx === -1) return prev;
    const realIdx = prev.length - 1 - idx;
    return [...prev.slice(0, realIdx), ...prev.slice(realIdx + 1)];
  });

  const navigate = (p: Page) => {
    setPage(p);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 relative
                    ${page === item.id ? 'text-[#080c14]' : 'text-muted-foreground hover:text-white'}`}
                  style={page === item.id ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  <Icon name={item.icon} size={14} fallback="Circle" />
                  {item.label}
                  {item.id === "cart" && cart.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold bg-pink-500 text-white">
                      {cart.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2 md:hidden">
              <button onClick={() => navigate("cart")} className="relative p-2">
                <Icon name="ShoppingCart" size={20} />
                {cart.length > 0 && (
                  <span className="absolute top-0 right-0 w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-bold bg-pink-500 text-white">
                    {cart.length}
                  </span>
                )}
              </button>
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2">
                <Icon name={mobileMenuOpen ? "X" : "Menu"} size={20} />
              </button>
            </div>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden py-3 border-t border-white/5 animate-fade-up">
              {NAV_ITEMS.map(item => (
                <button key={item.id} onClick={() => navigate(item.id)}
                  className={`w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                    ${page === item.id ? 'text-[#080c14]' : 'text-muted-foreground'}`}
                  style={page === item.id ? { background: 'linear-gradient(135deg, #00e5ff, #9b59f5)' } : {}}>
                  <Icon name={item.icon} size={16} fallback="Circle" />
                  {item.label}
                  {item.id === "cart" && cart.length > 0 && (
                    <span className="ml-auto text-xs font-bold px-2 py-0.5 rounded-full bg-pink-500 text-white">{cart.length}</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {page === "home" && <HomePage onNavigate={navigate} />}
        {page === "catalog" && <CatalogPage onAddToCart={addToCart} />}
        {page === "cart" && <CartPage cart={cart} onRemove={removeFromCart} onNavigate={navigate} />}
        {page === "orders" && <OrdersPage />}
        {page === "profile" && <ProfilePage />}
        {page === "admin" && <AdminPage />}
        {page === "contacts" && <ContactsPage />}
      </main>

      <footer className="glass-bright border-t border-white/5 mt-16 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-display font-black gradient-text text-lg">TechVolt</div>
          <div className="text-xs text-muted-foreground">© 2026 TechVolt. Все права защищены.</div>
          <div className="flex gap-4 text-xs text-muted-foreground">
            <button onClick={() => navigate("contacts")} className="hover:text-white transition-colors">Контакты</button>
            <button className="hover:text-white transition-colors">Политика конфиденциальности</button>
            <button className="hover:text-white transition-colors">Условия использования</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
