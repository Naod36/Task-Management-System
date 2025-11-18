import { useState } from "react";
import type { Task } from "../types";
import api from "../services/api";

import { motion, AnimatePresence } from "framer-motion";
import {
  List,
  User,
  PieChart,
  CodeXml,
  CircleCheckBig,
  LogOut,
  Menu,
  X,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
export default function EditTaskModal({
  task,
  users,
  projects,
  onClose,
  onSaved,
}: {
  task: Task;
  users: { id: number; name: string }[];
  projects: { id: number; name: string }[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    title: task.title,
    description: task.description || "",
    status: task.status,
    assigneeId: task.assigneeId || null,
    projectId: task.projectId,
    deadline: task.deadline || "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEditTask = async () => {
    setSaving(true);
    setError(null);

    try {
      const payload: any = {
        title: form.title,
        description: form.description || undefined,
        status: form.status || "PENDING",
        assigneeId: form.assigneeId ?? undefined,
        projectId: form.projectId,
        deadline: form.deadline
          ? new Date(form.deadline).toISOString()
          : undefined,
      };

      // call your api wrapper (axios instance)
      await api.put(`/tasks/${task.id}`, payload);

      setSaving(false);
      onSaved();
    } catch (err) {
      console.error("Failed to update task", err);
      setError("Failed to update task. Check console for details.");
      setSaving(false);
    }
  };

  //   const saveTask = async () => {
  //     await fetch(`http://localhost:3000/tasks/${task.id}`, {
  //       method: "PUT",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify(form),
  //     });

  //     onSaved();
  //   };
  const getTomorrowDate = () => {
    const today = new Date();
    // Set the date to tomorrow
    today.setDate(today.getDate() + 1);

    // Format the date as YYYY-MM-DD
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  return (
    <motion.div
      onClick={onClose}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
      >
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Edit Task</h2>

            <button
              className="p-2 rounded hover:bg-neutral-700"
              onClick={onClose}
            >
              <X />
            </button>
          </div>
          <div className="space-y-3">
            {/* Title */}
            <input
              className="w-full p-2 rounded bg-neutral-700"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />

            {/* Description */}
            <textarea
              className="w-full p-2 rounded bg-neutral-700"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
            <div className="flex flex-row gap-2  relative">
              {/* Project */}
              <select
                className="max-w-1/4 mr-1 p-2 rounded bg-neutral-700"
                value={form.projectId}
                onChange={(e) =>
                  setForm({ ...form, projectId: Number(e.target.value) })
                }
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>

              {/* Assignee */}
              <select
                className="max-w-1/4 mr-1 p-2 rounded bg-neutral-700"
                value={form.assigneeId ?? ""}
                onChange={(e) =>
                  setForm({
                    ...form,
                    assigneeId: e.target.value ? Number(e.target.value) : null,
                  })
                }
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {/* Status */}
              <select
                className="max-w-1/4 mr-1 p-2 rounded bg-neutral-700"
                value={form.status}
                onChange={(e) =>
                  setForm({ ...form, status: e.target.value as any })
                }
              >
                <option value="PENDING">Pending</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>

              {/* Deadline */}
              <input
                type="date"
                className="max-w-1/4 mr-1 p-2 rounded bg-neutral-700"
                value={form.deadline || ""}
                onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                min={getTomorrowDate()}
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button
                className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 rounded hover:scale-110 transition-all"
                onClick={onClose}
                disabled={saving}
              >
                Cancel
              </button>

              <button
                className="px-4 py-2 text-neutral-900 bg-neutral-100 rounded flex flex-row gap-2 items-center hover:bg-neutral-300 hover:shadow-xl hover:scale-110 transition-all"
                onClick={submitEditTask}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
