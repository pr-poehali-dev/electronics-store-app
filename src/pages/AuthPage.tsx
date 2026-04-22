/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Page } from "@/lib/constants";
import Breadcrumbs from "@/components/Breadcrumbs";

export default function AuthPage({ onLogin, onRegister, onNavigate }: { onLogin: (e: string, p: string) => Promise<{ ok: boolean; error?: string }>; onRegister: (d: any) => Promise<{ ok: boolean; error?: string }>; onNavigate: (p: Page) => void }) {
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
    <div>
      <Breadcrumbs crumbs={[{ label: "Главная", page: "home" }, { label: "Вход / Регистрация" }]} onNavigate={onNavigate} />
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
    </div>
  );
}