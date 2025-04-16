import { LucideIcon, ShoppingCart, Eye, Users } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string;
  icon?: keyof typeof iconMap;
}

const iconMap = {
  "shopping-cart": ShoppingCart,
  "eye": Eye,
  "users": Users,
  // ... more
};

export function StatCard({ label, value, icon = "eye" }: StatCardProps) {
  const Icon: LucideIcon = iconMap[icon] || Eye;
  return (
    <div className="bg-white border p-4 rounded shadow flex items-center gap-4">
      <Icon className="w-6 h-6 text-blue-500" />
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-xl font-bold">{value}</p>
      </div>
    </div>
  );
}