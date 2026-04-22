/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import StarRating from "@/components/StarRating";
import ProductCard from "@/components/ProductCard";
import { Page, Product, API_PRODUCTS, GADGETS_IMG } from "@/lib/constants";

export default function ProductPage({ productId, onNavigate, onAddToCart, token, user }: { productId: number; onNavigate: (p: Page) => void; onAddToCart: (p: Product) => void; token: string; user: any }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [activeTab, setActiveTab] = useState<"desc" | "specs" | "delivery" | "reviews">("desc");

  // Reviews state
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewStats, setReviewStats] = useState<any>(null);
  const [reviewForm, setReviewForm] = useState({ rating: 5, text: "", author_name: user?.first_name ? `${user.first_name} ${user.last_name || ""}`.trim() : "" });
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState("");
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const loadReviews = useCallback(() => {
    fetch(`${API_PRODUCTS}?section=reviews&product_id=${productId}`)
      .then(r => r.json())
      .then(d => { setReviews(d.reviews || []); setReviewStats(d.stats || null); })
      .catch(() => {});
  }, [productId]);

  const submitReview = async () => {
    if (!reviewForm.author_name.trim()) { setReviewError("Введите имя"); return; }
    setReviewLoading(true); setReviewError("");
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    const r = await fetch(`${API_PRODUCTS}?section=reviews`, {
      method: "POST", headers,
      body: JSON.stringify({ product_id: productId, rating: reviewForm.rating, text: reviewForm.text, author_name: reviewForm.author_name })
    }).catch(() => null);
    setReviewLoading(false);
    if (r?.status === 409) { setReviewError("Вы уже оставляли отзыв на этот товар"); return; }
    if (r?.ok) {
      setReviewSuccess(true);
      setReviewForm(f => ({ ...f, text: "" }));
      loadReviews();
      setTimeout(() => setReviewSuccess(false), 3000);
    } else {
      setReviewError("Ошибка при сохранении отзыва");
    }
  };

  useEffect(() => { loadReviews(); }, [loadReviews]);

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
            { id: "reviews", label: `Отзывы${reviewStats?.count ? ` (${reviewStats.count})` : ""}` },
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
          {activeTab === "reviews" && (
            <div className="space-y-6">
              {/* Stats bar */}
              {reviewStats && reviewStats.count > 0 && (
                <div className="flex gap-6 items-center flex-wrap">
                  <div className="text-center">
                    <div className="font-display font-black text-4xl text-cyan-400">{reviewStats.avg}</div>
                    <div className="flex justify-center mt-1">
                      {[1,2,3,4,5].map(i => <span key={i} className={i <= Math.round(reviewStats.avg) ? "text-yellow-400" : "text-gray-600"} style={{fontSize:16}}>★</span>)}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">{reviewStats.count} отзывов</div>
                  </div>
                  <div className="flex-1 space-y-1.5 min-w-[160px]">
                    {[5,4,3,2,1].map(r => {
                      const cnt = reviewStats.by_rating[r] || 0;
                      const pct = reviewStats.count > 0 ? (cnt / reviewStats.count) * 100 : 0;
                      return (
                        <div key={r} className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-3">{r}</span>
                          <span className="text-yellow-400 text-xs">★</span>
                          <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                            <div className="h-full rounded-full bg-yellow-400 transition-all" style={{width: `${pct}%`}} />
                          </div>
                          <span className="text-xs text-muted-foreground w-4">{cnt}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Reviews list */}
              {reviews.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Icon name="MessageSquare" size={36} className="mx-auto mb-3 opacity-30" />
                  <p>Отзывов пока нет. Будьте первым!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map(r => (
                    <div key={r.id} className="glass rounded-2xl p-4 neon-border">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
                            style={{background: 'linear-gradient(135deg, rgba(0,229,255,0.2), rgba(155,89,245,0.2))'}}>
                            {r.author_name[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold">{r.author_name}</span>
                              {r.is_verified && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10 flex items-center gap-0.5">
                                  <Icon name="BadgeCheck" size={10} /> Покупатель
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              {[1,2,3,4,5].map(i => <span key={i} className={i <= r.rating ? "text-yellow-400" : "text-gray-600"} style={{fontSize:11}}>★</span>)}
                              <span className="text-xs text-muted-foreground">{new Date(r.created_at).toLocaleDateString('ru-RU')}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      {r.text && <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>}
                    </div>
                  ))}
                </div>
              )}

              {/* Write review form */}
              <div className="glass rounded-2xl p-5 neon-border space-y-4" style={{borderColor: 'rgba(0,229,255,0.15)'}}>
                <h4 className="font-display font-bold text-sm">Оставить отзыв</h4>
                {reviewSuccess && (
                  <div className="glass rounded-xl p-3 border border-emerald-500/30 text-emerald-400 text-sm flex items-center gap-2">
                    <Icon name="Check" size={14} />Отзыв успешно опубликован!
                  </div>
                )}
                {/* Star selector */}
                <div>
                  <label className="text-xs text-muted-foreground mb-2 block">Ваша оценка *</label>
                  <div className="flex gap-1">
                    {[1,2,3,4,5].map(s => (
                      <button key={s} onClick={() => setReviewForm(f => ({...f, rating: s}))}
                        className="text-2xl transition-transform hover:scale-110"
                        style={{color: s <= reviewForm.rating ? '#facc15' : '#374151'}}>★</button>
                    ))}
                    <span className="text-sm text-muted-foreground ml-2 self-center">
                      {["", "Плохо", "Не очень", "Нормально", "Хорошо", "Отлично"][reviewForm.rating]}
                    </span>
                  </div>
                </div>
                {!user && (
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Ваше имя *</label>
                    <input value={reviewForm.author_name} onChange={e => setReviewForm(f => ({...f, author_name: e.target.value}))}
                      placeholder="Как вас зовут?" className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all" />
                  </div>
                )}
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">Комментарий</label>
                  <textarea value={reviewForm.text} onChange={e => setReviewForm(f => ({...f, text: e.target.value}))}
                    rows={3} placeholder="Расскажите о товаре — что понравилось или нет?"
                    className="w-full glass rounded-xl px-4 py-2.5 text-sm outline-none border border-transparent focus:border-cyan-500/40 transition-all resize-none" />
                </div>
                {reviewError && <div className="glass rounded-xl p-3 border border-red-500/30 text-red-400 text-sm">{reviewError}</div>}
                <button onClick={submitReview} disabled={reviewLoading}
                  className="gradient-btn px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 disabled:opacity-60">
                  <Icon name="Send" size={14} />
                  {reviewLoading ? "Публикуем..." : "Опубликовать отзыв"}
                </button>
                {!user && <p className="text-xs text-muted-foreground"><button onClick={() => onNavigate("auth")} className="text-cyan-400 hover:underline">Войдите</button>, чтобы отзыв получил метку «Покупатель»</p>}
              </div>
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
