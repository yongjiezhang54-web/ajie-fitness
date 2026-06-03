"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Flame, LogOut, User, BarChart3 } from "lucide-react";

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({ totalDays: 0, streak: 0, totalCheckIns: 0 });

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const fetchStats = useCallback(async () => {
    // Total check-in days
    const { data: daysData } = await supabase
      .from("check_ins")
      .select("date")
      .eq("user_id", user!.id);
    const uniqueDays = new Set((daysData || []).map(d => d.date));
    
    // Current streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split("T")[0];
      if (uniqueDays.has(key)) streak++;
      else break;
    }

    // Total check-ins count
    const { count } = await supabase
      .from("check_ins")
      .select("*", { count: "exact" })
      .eq("user_id", user!.id);

    setStats({ totalDays: uniqueDays.size, streak, totalCheckIns: count || 0 });
  }, [user]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user, fetchStats]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  if (loading || !user) return <div className="flex h-screen items-center justify-center">加载中...</div>;

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">我的</h1>

      {/* User Card */}
      <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl">
            <User className="h-7 w-7 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{user.email}</h2>
            <p className="text-sm text-gray-500">阿杰健身用户</p>
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mb-6 grid grid-cols-3 gap-3">
        <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-emerald-600">{stats.streak}</p>
          <p className="text-xs text-gray-500">连续天数</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-blue-600">{stats.totalDays}</p>
          <p className="text-xs text-gray-500">累计天数</p>
        </div>
        <div className="rounded-2xl bg-white p-3 text-center shadow-sm">
          <p className="text-xl font-bold text-orange-600">{stats.totalCheckIns}</p>
          <p className="text-xs text-gray-500">打卡次数</p>
        </div>
      </div>

      {/* Menu */}
      <div className="space-y-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-2xl bg-white px-5 py-4 text-left shadow-sm hover:bg-gray-50"
        >
          <LogOut className="h-5 w-5 text-red-500" />
          <span className="font-medium text-red-600">退出登录</span>
        </button>
      </div>

      {/* Footer */}
      <p className="mt-8 text-center text-xs text-gray-400">阿杰健身 v1.0 · 坚持就是胜利 💪</p>
    </main>
  );
}
