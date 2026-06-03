"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase";
import type { TrainingPlan } from "@/lib/database.types";
import { Plus, Pencil, Trash2 } from "lucide-react";
import PlanModal from "@/components/PlanModal";

export default function PlanPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<TrainingPlan[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState<TrainingPlan | null>(null);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [loading, user, router]);

  useEffect(() => {
    if (user) fetchPlans();
  }, [user]);

  const fetchPlans = async () => {
    const { data } = await supabase
      .from("training_plans")
      .select("*")
      .order("sort_order", { ascending: true });
    if (data) setPlans(data);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除此训练项目？")) return;
    await supabase.from("training_plans").delete().eq("id", id);
    fetchPlans();
  };

  const handleEdit = (plan: TrainingPlan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  if (loading || !user) return <div className="flex h-screen items-center justify-center">加载中...</div>;

  return (
    <main className="mx-auto max-w-md px-4 pb-20 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">训练计划</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700"
        >
          <Plus className="h-4 w-4" /> 添加
        </button>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <p className="text-gray-500">还没有训练项目，点击上方添加按钮创建</p>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <div key={plan.id} className="rounded-2xl bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{plan.icon || "💪"}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900">{plan.name}</h3>
                    <p className="text-sm text-gray-500">
                      目标: {plan.target} {plan.unit}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(plan)} className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(plan.id)} className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchPlans(); }}
        />
      )}
    </main>
  );
}
