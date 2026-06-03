"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flame, ListTodo, CalendarDays, BarChart3, User } from "lucide-react";

const navItems = [
  { href: "/", label: "首页", icon: Flame },
  { href: "/plan", label: "训练", icon: ListTodo },
  { href: "/records", label: "记录", icon: CalendarDays },
  { href: "/stats", label: "统计", icon: BarChart3 },
  { href: "/profile", label: "我的", icon: User },
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60">
      <div className="mx-auto flex h-14 max-w-md items-center justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1 text-xs font-medium transition-colors ${
                isActive
                  ? "text-emerald-600"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <Icon className={`h-5 w-5 ${isActive ? "text-emerald-600" : "text-gray-500"}`} />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
