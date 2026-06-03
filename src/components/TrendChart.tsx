"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface DayStat {
  date: string;
  display: string;
  completed: number;
  total: number;
  done: boolean;
}

export default function TrendChart({ data }: { data: DayStat[] }) {
  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} />
        <XAxis dataKey="display" tick={{ fontSize: 10 }} interval={4} />
        <YAxis tick={{ fontSize: 10 }} />
        <Tooltip contentStyle={{ fontSize: 12 }} />
        <Bar dataKey="completed" name="完成量" radius={[4, 4, 0, 0]}>
          {data.map((entry, i) => (
            <Cell key={i} fill={entry.done ? "#059669" : "#d1d5db"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
