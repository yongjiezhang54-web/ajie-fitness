"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { TrainingPlan } from "@/lib/database.types";

const ICONS = ["💪", "🏃", "🧘", "🚴", "🏊", "⛹️", "🤸", "🏋️", "🧗", "🚣"];

interface Props {
  plan: TrainingPlan | null;
  onClose: () => void;
  onSaved: () => void;
}

export default function PlanModal({ plan, onClose, onSaved }: Props) {
  const [name, setName] = useState(plan?.name || "");
  const [target, setTarget] = useState(plan?.target?.toString() || "10");
  const [unit, setUnit] = useState(plan?.unit || "次");
  const [icon, setIcon] = useState(plan?.icon || "💪");
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
  }, []);

  const handleSave = async () => {
    if (!name.trim() || !userId) return;
    setSaving(true);
    const payload = {
      user_id: userId,
      name: name.trim(),
      target: parseInt(target) || 1,
      unit,
      icon,
    };
    if (plan) {
      await supabase.from("training_plans").update(payload).eq("id", plan.id);
    } else {
      await supabase.from("training_plans").insert(payload);
    }
    setSaving(false);
    onSaved();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50" onClick={onClose}>
      <div className="w-full max-w-md rounded-t-2xl bg-white p-6" onClick={e => e.stopPropagation()}>
        <h2 className="mb-4 text-lg font-bold text-gray-900">{plan ? "编辑训练项目" : "新增训练项目"}</h2>

        <div className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">项目名称</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              placeholder="如：俯卧撑、深蹲、跑步"
            />
          </div>

          {/* Target + Unit */}
          <div className="flex gap-3">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700">目标数量</label>
              <input
                type="number"
                min="1"
                value={target}
                onChange={e => setTarget(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>
            <div className="w-24">
              <label className="block text-sm font-medium text-gray-700">单位</label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                <option value="次">次</option>
                <option value="分钟">分钟</option>
                <option value="秒">秒</option>
                <option value="公里">公里</option>
                <option value="组">组</option>
              </select>
            </div>
          </div>

          {/* Icon */}
          <div>
            <label className="block text-sm font-medium text-gray-700">图标</label>
            <div className="mt-1 flex flex-wrap gap-2">
              {ICONS.map(emj => (
                <button
                  key={emj}
                  type="button"
                  onClick={() => setIcon(emj)}
                  className={`h-10 w-10 rounded-lg text-xl transition-colors ${
                    icon === emj ? "bg-emerald-100 ring-2 ring-emerald-500" : "bg-gray-100 hover:bg-gray-200"
                  }`}
                >
                  {emj}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-6 flex gap-3">
          <button onClick={onClose} className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">
            取消
          </button>
          <button
            onClick={handleSave}
            disabled={saving || !name.trim()}
            className="flex-1 rounded-lg bg-emerald-600 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "保存中..." : "保存"}
          </button>
        </div>
      </div>
    </div>
  );
}
