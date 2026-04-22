 
import Icon from "@/components/ui/icon";
import { Page } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ContactsPage({ onNavigate }: { onNavigate: (p: Page) => void }) {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Контакты" }]} onNavigate={onNavigate} />
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