export default function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined) {
    return <span className="text-2xl font-black text-gray-300">—</span>;
  }
  if (delta > 0) {
    return <span className="text-2xl font-black text-green-600">+{delta} ↑</span>;
  }
  if (delta < 0) {
    return <span className="text-2xl font-black text-red-500">{delta} ↓</span>;
  }
  return <span className="text-2xl font-black text-gray-400">= →</span>;
}
