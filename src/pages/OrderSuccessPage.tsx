 
import Icon from "@/components/ui/icon";
import { Page } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function OrderSuccessPage({ orderId, onNavigate }: { orderId: number; onNavigate: (p: Page) => void }) {
  return (
    <div>
      <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Заказ оформлен" }]} onNavigate={onNavigate} />
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
    </div>
  );
}