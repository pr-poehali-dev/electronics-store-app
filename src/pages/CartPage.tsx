 
import Icon from "@/components/ui/icon";
import { Page, CartItem, GADGETS_IMG } from "@/lib/constants";

export default function CartPage({ cart, onUpdate, onNavigate }: { cart: CartItem[]; onUpdate: (cart: CartItem[]) => void; onNavigate: (p: Page) => void }) {
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
