 

export const API_PRODUCTS = "https://functions.poehali.dev/1db3436b-c29c-4d57-be60-e93e3b495485";
export const API_AUTH_ORDERS = "https://functions.poehali.dev/813df701-049a-486d-bdd1-f0298ddecaeb";
export const API_ADMIN = "https://functions.poehali.dev/c2f99a74-f275-4898-9efb-1eb0ee5ccfd4";

export const HERO_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/f0874d31-46a3-403a-b8d9-a111da942884.jpg";
export const CATALOG_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/0b1b6e37-0a99-4e72-bdfc-19102cac72b2.jpg";
export const GADGETS_IMG = "https://cdn.poehali.dev/projects/38aa9852-5718-430f-acc5-30fa30b0d597/files/2b3f9fd8-0496-43f6-99e6-6d644bf3dcd6.jpg";

export type Page =
  | "home" | "catalog" | "product" | "cart" | "checkout"
  | "orders" | "profile" | "admin" | "admin-products"
  | "admin-customers" | "admin-analytics" | "contacts" | "auth";

export interface User {
  id: number; email: string; first_name: string; last_name: string; role: string;
}

export interface Product {
  id: number; name: string; brand: string; category: string;
  price: number; old_price?: number | null;
  rating: number; reviews_count: number;
  power_info?: string; warranty?: string; badge?: string | null;
  description?: string; img_url?: string;
  stock: number; is_active: boolean;
}

export interface CartItem extends Product { quantity: number; }

export const STATUS_LABELS: Record<string, string> = {
  processing: "Обрабатывается", shipped: "Отправлен", delivered: "Доставлен",
  cancelled: "Отменён", pending: "Ожидает оплаты",
};

export const STATUS_COLORS: Record<string, string> = {
  delivered: "text-emerald-400 bg-emerald-400/10",
  shipped: "text-cyan-400 bg-cyan-400/10",
  processing: "text-yellow-400 bg-yellow-400/10",
  cancelled: "text-red-400 bg-red-400/10",
  pending: "text-orange-400 bg-orange-400/10",
};

export const CATEGORIES = ["Все", "Смартфоны", "Ноутбуки", "Аудио", "Носимые", "Планшеты", "Аксессуары", "Камеры"];

export const NAV_ITEMS: { id: Page; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "Home" },
  { id: "catalog", label: "Каталог", icon: "Grid3X3" },
  { id: "cart", label: "Корзина", icon: "ShoppingCart" },
  { id: "orders", label: "Заказы", icon: "Package" },
  { id: "contacts", label: "Контакты", icon: "MessageSquare" },
];
