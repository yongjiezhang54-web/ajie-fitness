"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import { ChevronLeft, ChevronRight, Flame } from "lucide-react";
import Link from "next/link";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

export default function RecordsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [yearMonth, setYearMonth] = useState(() => {
    const n = new Date();
    return [n.getFullYear(), n.getMonth()] as [number, number];
  });
  const [completedDates, setCompletedDates] = useState<Set<string>>(new Set());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [dayRecords, setDayRecords] = useState<any[]>([]);

  const fetchMonth = useCallback(async (y: number, m: number) => {
    if (!user) return;
    const start = new Date(y, m, 1).toISOString().split("T")[0];
    const end = new Date(y, m + 1, 0).toISOString().split("T")[0];
    const { data } = await supabase
      .from("check_ins")
      .select("date, completed, training_plans(name, unit)")
      .eq("user_id", user.id)
      .gte("date", start)
      .lte("date", end);
    // Group by date: a date is "completed" if all plans for that date are done
    const dateMap = new Map<string, { total: number; done: number }>();
    (data || []).forEach((r: any) => {
      const d = r.date;
      if (!dateMap.has(d)) dateMap.set(d, { total: 0, done: 0 });
      const entry = dateMap.get(d)!;
      entry.total++;
      if (r.completed >= (r.training_plans?.target || 1)) entry.done++;
    });
    const completed = new Set<string>();
    dateMap.forEach((v, k) => { if (v.done >= v.total && v.total > 0) completed.add(k); });
    setCompletedDates(completed);
  }, [user]);

  useEffect(() => { if (!loading && !user) router.push("/login"); }, [loading, user, router]);
  useEffect(() => { if (user) fetchMonth(yearMonth[0], yearMonth[1]); }, [user, yearMonth, fetchMonth]);

  const prevMonth = () => setYearMonth(([y, m]) => m === 0 ? [y - 1, 11] : [y, m - 1]);
  const nextMonth = () => setYearMonth(([y, m]) => m === 11 ? [y + 1, 0] : [y, m + 1]);

  const getDaysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
  const getFirstDayOfWeek = (y: number, m: number) => {
    const d = new Date(y, m, 1).getDay();
    return d === 0 ? 6 : d - 1; // Monday=0
  };

  const handleDayClick = async (day: number) => {
    const dateStr = `${yearMonth[0]}-${String(yearMonth[1] + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    setSelectedDate(dateStr);
    const { data } = await supabase
      .from("check_ins")
      .select("*, training_plans(name, target, unit)")
      .eq("user_id", user!.id)
      .eq("date", dateStr);
    setDayRecords(data || []);
  };

  const y = yearMonth[0], m = yearMonth[1];
  const daysInMonth = getDaysInMonth(y, m);
  const firstDay = getFirstDayOfWeek(y, m);
  const today = new Date().toISOString().split("T")[0];

  const days: (number | null)[] = [...Array(firstDay).fill(null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">打卡记录</h1>

      {/* Calendar */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        {/* Month nav */}
        <div className="mb-4 flex items-center justify-between">
          <button onClick={prevMonth} className="rounded-lg p-2 hover:bg-gray-100"><ChevronLeft className="h-5 w-5" /></button>
          <span className="text-lg font-semibold text-gray-900">{y}年{m + 1}月</span>
          <button onClick={nextMonth} className="rounded-lg p-2 hover:bg-gray-100"><ChevronRight className="h-5 w-5" /></button>
        </div>

        {/* Weekday headers */}
        <div className="mb-2 grid grid-cols-7 gap-1 text-center text-xs text-gray-500">
          {WEEKDAYS.map(d => <div key={d}>{d}</div>)}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (day === null) return <div key={i} />;
            const dateStr = `${y}-${String(m + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const isCompleted = completedDates.has(dateStr);
            const isToday = dateStr === today;
            const isSelected = dateStr === selectedDate;
            return (
              <button
                key={`d-${day}`}
                onClick={() => handleDayClick(day)}
                className={`aspect-square rounded-lg text-sm font-medium transition-colors ${
                  isSelected ? "bg-emerald-600 text-white" :
                  isCompleted ? "bg-emerald-100 text-emerald-800" :
                  isToday ? "bg-blue-100 text-blue-800" :
                  "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {day}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected day detail */}
      {selectedDate && (
        <div className="mt-4 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-3 font-semibold text-gray-900">{selectedDate}</h3>
          {dayRecords.length === 0 ? (
            <p className="text-sm text-gray-400">暂无打卡记录</p>
          ) : (
            <div className="space-y-2">
              {dayRecords.map((r) => (
                <div key={r.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <span className="text-sm text-gray-700">{r.training_plans?.name || "未知"}</span>
                  <span className={`text-sm font-medium ${r.completed >= (r.training_plans?.target || 1) ? "text-emerald-600" : "text-gray-500"}`}>
                    {r.completed}/{r.training_plans?.target || "?"} {r.training_plans?.unit || ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
