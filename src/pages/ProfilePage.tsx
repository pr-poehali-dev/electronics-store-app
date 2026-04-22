/* eslint-disable @typescript-eslint/no-explicit-any */
import Icon from "@/components/ui/icon";
import { Page, User } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function ProfilePage({ user, onLogout, onNavigate }: { user: User | null; onLogout: () => void; onNavigate: (p: Page) => void }) {
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
      <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Профиль" }]} onNavigate={onNavigate} />
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