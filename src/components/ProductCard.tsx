import Icon from "@/components/ui/icon";
import StarRating from "@/components/StarRating";
import { Product, GADGETS_IMG } from "@/lib/constants";

interface Props {
  product: Product;
  onAddToCart: (p: Product) => void;
  onNavigateProduct?: (id: number) => void;
}

export default function ProductCard({ product, onAddToCart, onNavigateProduct }: Props) {
  const img = product.img_url || GADGETS_IMG;
  return (
    <div className="glass card-hover rounded-2xl overflow-hidden neon-border group flex flex-col">
      <div className="relative h-44 overflow-hidden cursor-pointer" onClick={() => onNavigateProduct?.(product.id)}>
        <img src={img} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#080c14] via-transparent to-transparent" />
        {product.badge && (
          <span className="absolute top-3 left-3 text-xs font-bold px-2 py-1 rounded-full"
            style={{ background: 'linear-gradient(135deg, #00e5ff, #9b59f5)', color: '#080c14' }}>
            {product.badge}
          </span>
        )}
        {product.stock < 5 && product.stock > 0 && (
          <span className="absolute top-3 right-3 text-xs font-bold px-2 py-1 rounded-full bg-orange-500/20 text-orange-400">Мало</span>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-muted-foreground mb-1">{product.brand} · {product.category}</div>
        <div
          className="font-semibold text-sm leading-tight mb-2 text-white flex-1 cursor-pointer hover:text-cyan-400 transition-colors"
          onClick={() => onNavigateProduct?.(product.id)}>
          {product.name}
        </div>
        <div className="flex items-center gap-2 mb-2">
          <StarRating rating={product.rating} />
          <span className="text-xs text-muted-foreground">{product.reviews_count}</span>
        </div>
        <div className="flex gap-3 text-xs text-muted-foreground mb-3">
          {product.power_info && (
            <span className="flex items-center gap-1"><Icon name="Zap" size={10} className="text-cyan-400" />{product.power_info}</span>
          )}
          {product.warranty && (
            <span className="flex items-center gap-1"><Icon name="Shield" size={10} className="text-purple-400" />{product.warranty}</span>
          )}
        </div>
        <div className="flex items-end justify-between mt-auto">
          <div>
            <div className="text-lg font-bold text-cyan-400">{product.price.toLocaleString('ru-RU')} ₽</div>
            {product.old_price && (
              <div className="text-xs text-muted-foreground line-through">{product.old_price.toLocaleString('ru-RU')} ₽</div>
            )}
          </div>
          <button
            onClick={() => onAddToCart(product)}
            disabled={product.stock === 0}
            className="gradient-btn px-3 py-2 rounded-xl text-sm flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed">
            <Icon name="Plus" size={14} />{product.stock === 0 ? "Нет" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}
