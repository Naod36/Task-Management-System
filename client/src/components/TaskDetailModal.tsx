import { useState, useEffect } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

interface TaskDetailModalProps {
  task: any;
  user: any;
  onClose: () => void;
}

interface TaskReport {
  id: number;
  message: string;
  createdAt: string;
  user: {
    id: number;
    name: string;
  };
}

export default function TaskDetailModal({
  task,
  user,
  onClose,
}: TaskDetailModalProps) {
  const [report, setReport] = useState("");
  const [reports, setReports] = useState<TaskReport[]>([]);

  useEffect(() => {
    if (user.role === "ADMIN") {
      fetchReports();
    }
  }, [task]);

  async function fetchReports() {
    try {
      const res = await api.get(`/tasks/${task.id}/reports`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setReports(res.data);
      console.log(res.data, "full report data ");
    } catch (err) {
      console.error("Failed to fetch reports", err);
    }
  }
  async function submitReport() {
    if (!report) return; // reportText is the textarea state
    try {
      const token = localStorage.getItem("token");

      await api.post(
        `/tasks/${task.id}/report`,
        { userId: user.id, message: report },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Report submitted successfully!");
      setReport(""); // clear textarea
      fetchReports(); // optional: refresh reports
    } catch (err) {
      console.error("Failed to submit report", err);
      alert("Failed to submit report");
    }
  }

  //   async function submitReport() {
  //     try {
  //       await api.post(
  //         `/task-reports`,
  //         { taskId: task.id, report },
  //         {
  //           headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
  //         }
  //       );
  //       setReport("");
  //       alert("Report submitted!");
  //       fetchReports();
  //     } catch (err) {
  //       console.error("Failed to submit report", err);
  //     }
  //   }

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
            <h2 className="text-xl font-semibold">Task Details</h2>

            <button
              className="p-2 rounded hover:bg-neutral-700"
              onClick={onClose}
            >
              <X />
            </button>
          </div>

          <h2 className="text-xl font-bold mb-2">{task.title}</h2>
          <p className="text-gray-300 mb-2">
            {task.description || "No description"}
          </p>
          <p className="text-gray-400 text-sm mb-2">
            Status:{" "}
            <span className="font-medium">{task.status.replace("_", " ")}</span>
          </p>
          {task.deadline && (
            <p className="text-gray-400 text-sm mb-2">
              Deadline: {new Date(task.deadline).toLocaleDateString()}
            </p>
          )}
          <p className="text-gray-400 text-sm mb-4">
            Assigned: {task.assignee?.name || "Unassigned"}
          </p>

          {/* MEMBER REPORT SUBMISSION */}
          {user.role === "MEMBER" && (
            <div className="flex flex-col gap-2">
              <textarea
                className="bg-neutral-800 p-2 rounded text-sm text-white resize-none"
                rows={4}
                placeholder="Write your report..."
                value={report}
                onChange={(e) => setReport(e.target.value)}
              />
              <button
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-white font-medium"
                onClick={submitReport}
              >
                Submit Report
              </button>
            </div>
          )}

          {/* ADMIN VIEW REPORTS */}
          {user.role === "ADMIN" && reports.length > 0 && (
            <div className="flex flex-col gap-2 mt-4">
              {reports.map((r) => (
                <div
                  key={r.id}
                  className="bg-neutral-800 p-2 gap-2 rounded text-sm text-gray-300"
                >
                  <p className=" text-neutral-200">From : {r.user.name}</p>

                  <p className=" text-neutral-400">report : {r.message}</p>
                  <div className="w-full h-0.5 bg-neutral-500/10 mt-2"></div>
                  <p className=" text-neutral-600">
                    {new Date(r.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          {user.role === "ADMIN" && reports.length === 0 && (
            <p className="text-gray-400 text-sm mt-2">
              No reports submitted yet.
            </p>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
