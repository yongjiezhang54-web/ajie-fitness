"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { TodayStatus } from "@/lib/database.types";
import { CheckCircle2, Circle, Plus } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [todayStatus, setTodayStatus] = useState<TodayStatus[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const fetchToday = useCallback(async () => {
    if (!user) return;
    setLoadingData(true);
    const { data, error } = await supabase.rpc("get_today_status", { uid: user.id });
    if (!error && data) setTodayStatus(data as TodayStatus[]);
    setLoadingData(false);
  }, [user]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) fetchToday();
  }, [user, fetchToday]);

  // 切换完成状态：已完成 → 取消，未完成 → 标记完成
  const handleToggle = async (planId: string) => {
    if (!user) return;
    const existing = todayStatus.find(s => s.plan_id === planId);
    const isDone = existing?.is_done ?? false;
    const newCompleted = isDone ? 0 : (existing?.target || 1);
    await supabase.from("check_ins").upsert({
      user_id: user.id,
      plan_id: planId,
      date: new Date().toISOString().split("T")[0],
      completed: newCompleted,
    }, { onConflict: "user_id,plan_id,date" });
    fetchToday();
  };

  const totalPlans = todayStatus.length;
  const donePlans = todayStatus.filter(s => s.is_done).length;
  const allDone = totalPlans > 0 && donePlans === totalPlans;
  const todayStr = new Date().toLocaleDateString("zh-CN", { month: "long", day: "numeric", weekday: "long" });

  if (loading || !user) return <div className="flex h-screen items-center justify-center">加载中...</div>;

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      {/* Header */}
      <div className="mb-6">
        <p className="text-sm text-gray-500">{todayStr}</p>
        <h1 className="text-2xl font-bold text-gray-900">今日训练</h1>
      </div>

      {/* Overall Progress */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 p-5 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-emerald-100">今日完成</p>
            <p className="mt-1 text-3xl font-bold">{donePlans}/{totalPlans}</p>
            <p className="mt-1 text-sm text-emerald-100">
              {totalPlans === 0 ? "暂未设置训练计划" : allDone ? "🎉 全部完成！" : `还需完成 ${totalPlans - donePlans} 项`}
            </p>
          </div>
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 text-3xl">
            {allDone ? "🏆" : "💪"}
          </div>
        </div>
      </div>

      {/* Training List */}
      {loadingData ? (
        <p className="py-8 text-center text-gray-400">加载中...</p>
      ) : totalPlans === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="mb-3 text-gray-500">还没有训练计划</p>
          <Link href="/plan" className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" /> 去设置计划
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {todayStatus.map((item) => {
            const done = item.is_done;
            return (
              <div key={item.plan_id} className="rounded-2xl bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{item.icon || "💪"}</span>
                      <h3 className={`font-semibold ${done ? "text-gray-400 line-through" : "text-gray-900"}`}>
                        {item.plan_name}
                      </h3>
                      {done && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">
                      目标: {item.target} {item.unit}
                    </p>
                    {/* Progress bar */}
                    <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-gray-100">
                      <div
                        className="h-full rounded-full bg-emerald-500 transition-all"
                        style={{ width: done ? "100%" : "0%" }}
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggle(item.plan_id)}
                    className={`ml-3 flex h-12 w-12 items-center justify-center rounded-full text-white transition-all ${
                      done
                        ? "bg-emerald-500 shadow-md"
                        : "border-2 border-emerald-500 bg-white text-emerald-500 hover:bg-emerald-50"
                    }`}
                  >
                    {done ? <CheckCircle2 className="h-6 w-6" /> : <Circle className="h-6 w-6" />}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}
