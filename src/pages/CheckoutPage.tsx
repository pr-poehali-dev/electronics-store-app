 
import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Page, CartItem, User, API_AUTH_ORDERS } from "@/lib/constants";

export default function CheckoutPage({ cart, token, user, onSuccess, onNavigate }: {
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
