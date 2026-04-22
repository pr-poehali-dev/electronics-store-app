 
import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import ProductCard from "@/components/ProductCard";
import { Page, Product, API_PRODUCTS, HERO_IMG, CATALOG_IMG, GADGETS_IMG } from "@/lib/constants";

export default function HomePage({ onNavigate, onAddToCart, onNavigateProduct }: { onNavigate: (p: Page) => void; onAddToCart: (p: Product) => void; onNavigateProduct: (id: number) => void }) {
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
              <div className="text-sm font-semibold">{s.label}</div>
              <div className="text-xs text-muted-foreground">{s.value}</div>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
