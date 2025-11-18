import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
export default function DeleteTaskModal({
  task,
  onClose,
  onDeleted,
}: {
  task: { id: number; title: string };
  onClose: () => void;
  onDeleted: () => void;
}) {
  const deleteTask = async () => {
    await fetch(`http://localhost:3000/tasks/${task.id}`, {
      method: "DELETE",
    });

    onDeleted();
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.15 }}
        className="bg-neutral-900 p-6 rounded-xl shadow-xl w-100 border border-neutral-700"
      >
        {" "}
        <h3 className="text-lg font-bold mb-2 text-red-400">Delete User</h3>
        <p className="text-neutral-300 mb-2">
          Are you sure you want to delete this task?
        </p>
        <p className="text-neutral-500 text-xs mb-4">
          This action is irreversible
        </p>
        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600"
            onClick={onClose}
          >
            Cancel
          </button>

          <button
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold"
            onClick={deleteTask}
          >
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}
