"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { Flame, Calendar, TrendingUp, Trophy } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";

interface DayStat {
  date: string;
  display: string;
  completed: number;
  total: number;
  done: boolean;
}

// 动态加载图表组件（recharts 只在统计页才下载）
const TrendChart = dynamic(() => import("@/components/TrendChart"), {
  ssr: false,
  loading: () => <div className="h-[200px] animate-pulse rounded-lg bg-gray-100" />,
});

export default function StatsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<DayStat[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  const fetchStats = useCallback(async () => {
    setLoadingData(true);
    const end = new Date();
    const start = subDays(end, 29);
    const startStr = start.toISOString().split("T")[0];
    const endStr = end.toISOString().split("T")[0];

    const { data } = await supabase
      .from("check_ins")
      .select("date, completed, training_plans(target)")
      .eq("user_id", user!.id)
      .gte("date", startStr)
      .lte("date", endStr);

    const days = eachDayOfInterval({ start, end });
    const dayMap = new Map<string, DayStat>();
    days.forEach(d => {
      const key = format(d, "yyyy-MM-dd");
      dayMap.set(key, { date: key, display: format(d, "M/d"), completed: 0, total: 0, done: false });
    });

    (data || []).forEach((r: any) => {
      const key = r.date;
      if (!dayMap.has(key)) return;
      const entry = dayMap.get(key)!;
      entry.total++;
      if (r.completed >= (r.training_plans?.target || 1)) entry.done = true;
      entry.completed += r.completed;
    });

    setStats(Array.from(dayMap.values()));
    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user, fetchStats]);

  const consecutiveDays = useMemo(() => {
    let count = 0;
    for (let i = stats.length - 1; i >= 0; i--) {
      if (stats[i].done) count++;
      else break;
    }
    return count;
  }, [stats]);

  const totalDays = stats.filter(s => s.done).length;
  const monthRate = useMemo(() => {
    const thisMonth = stats.filter(s => s.date.startsWith(format(new Date(), "yyyy-MM")));
    if (thisMonth.length === 0) return 0;
    return Math.round((thisMonth.filter(s => s.done).length / thisMonth.length) * 100);
  }, [stats]);

  if (loading || !user) return <div className="flex h-screen items-center justify-center">加载中...</div>;

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">数据统计</h1>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        <StatCard icon={<Flame className="h-6 w-6 text-orange-500" />} label="连续打卡" value={`${consecutiveDays}天`} color="orange" />
        <StatCard icon={<Calendar className="h-6 w-6 text-blue-500" />} label="累计训练" value={`${totalDays}天`} color="blue" />
        <StatCard icon={<TrendingUp className="h-6 w-6 text-emerald-500" />} label="本月完成率" value={`${monthRate}%`} color="emerald" />
        <StatCard icon={<Trophy className="h-6 w-6 text-amber-500" />} label="近30天打卡" value={`${totalDays}/30`} color="amber" />
      </div>

      {/* Trend Chart - 动态加载 */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h3 className="mb-3 font-semibold text-gray-900">近30天训练趋势</h3>
        {loadingData ? (
          <div className="h-[200px] animate-pulse rounded-lg bg-gray-100" />
        ) : (
          <TrendChart data={stats} />
        )}
      </div>
    </main>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) {
  const bgMap: Record<string, string> = {
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    emerald: "bg-emerald-50",
    amber: "bg-amber-50",
  };
  return (
    <div className={`rounded-2xl ${bgMap[color] || "bg-gray-50"} p-4`}>
      <div className="mb-2">{icon}</div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="mt-1 text-xs text-gray-500">{label}</p>
    </div>
  );
}
