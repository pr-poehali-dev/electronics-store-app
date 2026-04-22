 
import { useState } from "react";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/hooks/useAuth";
import { Page, Product, CartItem, NAV_ITEMS } from "@/lib/constants";

import HomePage from "@/pages/HomePage";
import ProductPage from "@/pages/ProductPage";
import CatalogPage from "@/pages/CatalogPage";
import CartPage from "@/pages/CartPage";
import CheckoutPage from "@/pages/CheckoutPage";
import OrderSuccessPage from "@/pages/OrderSuccessPage";
import OrdersPage from "@/pages/OrdersPage";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import ContactsPage from "@/pages/ContactsPage";
import AdminPage from "@/pages/admin/AdminPage";
import AdminProductsPage from "@/pages/admin/AdminProductsPage";
import AdminCustomersPage from "@/pages/admin/AdminCustomersPage";
import AdminAnalyticsPage from "@/pages/admin/AdminAnalyticsPage";

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
        {page === "product" && currentProductId && <ProductPage productId={currentProductId} onNavigate={navigate} onAddToCart={addToCart} token={token} user={user} />}
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
