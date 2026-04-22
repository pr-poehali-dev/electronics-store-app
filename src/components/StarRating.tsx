export default function StarRating({ rating, size = 12 }: { rating: number; size?: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= Math.floor(rating) ? "text-yellow-400" : "text-gray-600"} style={{ fontSize: size }}>★</span>
      ))}
    </div>
  );
}
