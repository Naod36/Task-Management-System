import { useEffect, useState } from "react";
import type { Task, Project } from "../types";
import EditTaskModal from "./EditTaskModal";
import DeleteTaskModal from "./DeleteTaskModal";
import TaskDetailModal from "./TaskDetailModal";
import api from "../services/api";
import {
  User,
  CodeXml,
  CircleCheckBig,
  LogOut,
  Menu,
  X,
  Edit,
  Plus,
  Trash2,
} from "lucide-react";
import { div } from "framer-motion/client";
import { AnimatePresence } from "framer-motion";

interface User {
  id: number;
  name: string;
  email?: string;
  role: "ADMIN" | "MEMBER";
}

interface TasksSectionProps {
  tasks: Task[];
  users: User[];
  projects: Project[];
  fetchTasks: () => void;
}

interface TaskReport {
  id: number;
  message: string;
  seen: boolean;
  taskId: number;
  user: User;
  createdAt: string;
}

export default function TasksSection({
  tasks = [],
  users = [],
  projects = [],
  fetchTasks,
}: TasksSectionProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [taskDetail, setTaskDetail] = useState<Task | null>(null);
  const [taskReports, setTaskReports] = useState<Record<number, TaskReport[]>>(
    {}
  );
  const [selectedProject, setSelectedProject] = useState<number | "ALL">("ALL");
  const [selectedUser, setSelectedUser] = useState<number | "ALL">("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string | "ALL">("ALL");
  const [user, setUser] = useState<User | null>(null);

  // FILTER LOGIC
  const filteredTasks = tasks
    .filter((task) => {
      if (user?.role === "MEMBER") return task.assigneeId === user.id;
      return true;
    })
    .filter((task) => {
      const byProject =
        selectedProject === "ALL" || task.projectId === selectedProject;
      const byUser = selectedUser === "ALL" || task.assigneeId === selectedUser;
      const byStatus =
        selectedStatus === "ALL" || task.status === selectedStatus;
      return byProject && byUser && byStatus;
    });

  useEffect(() => {
    fetchUser();
  }, []);

  useEffect(() => {
    if (user?.role === "ADMIN") fetchAllReports();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tasks, user]);

  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");
      const userRes = await api.get("/users/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(userRes.data);
    } catch (err) {
      console.log("Not authorized or no /users/me", err);
    }
  }

  async function fetchAllReports() {
    const reportsData: Record<number, TaskReport[]> = {};
    for (const task of tasks) {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get(`/tasks/${task.id}/reports`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        reportsData[task.id] = res.data;
      } catch (err) {
        console.error(`Failed to fetch reports for task ${task.id}`, err);
        reportsData[task.id] = [];
      }
    }
    setTaskReports(reportsData);
  }

  const getDaysLeft = (deadline: string | Date) => {
    const today = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getDeadlineColor = (daysLeft: number) => {
    if (daysLeft > 7) return "bg-green-600";
    if (daysLeft > 3) return "bg-yellow-500";
    if (daysLeft >= 0) return "bg-red-600";
    return "bg-neutral-700";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "DONE":
        return "bg-green-700 text-green-200";
      case "IN_PROGRESS":
        return "bg-yellow-600 text-yellow-900";
      case "PENDING":
        return "bg-neutral-600 text-neutral-300";
      default:
        return "bg-neutral-600";
    }
  };

  // Open task modal and mark reports as seen
  async function handleOpenTaskDetail(task: Task) {
    setTaskDetail(task);
    if (user?.role === "ADMIN") {
      try {
        const reportsForTask = taskReports[task.id] || [];
        const unseenReports = reportsForTask.filter((r) => !r.seen);

        if (unseenReports.length > 0) {
          for (const r of unseenReports) {
            await api.put(`/tasks/reports/${r.id}/seen`); // backend endpoint to mark seen
          }
          // Refresh reports
          fetchAllReports();
        }
      } catch (err) {
        console.error("Failed to mark reports as seen", err);
      }
    }
  }

  return (
    <div className="flex flex-col gap-2 p-4 bg-neutral-700/40 rounded-xl shadow-md max-h-auto overflow-y-auto">
      {/* Title */}

      <div className="flex justify-between items-center  ">
        {user?.role === "ADMIN" && (
          <h2 className="text-xl font-bold">All Tasks</h2>
        )}
        {user?.role === "MEMBER" && (
          <h2 className="text-xl font-bold">My Tasks</h2>
        )}

        {/* FILTER BAR */}
        <div className="flex flex-col  justify-center md:flex-row gap-4 ">
          {user?.role === "ADMIN" && (
            <>
              <select
                className="bg-neutral-300 text-neutral-900 p-1 rounded-lg "
                value={selectedProject}
                onChange={(e) =>
                  setSelectedProject(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                  )
                }
              >
                <option value="ALL">All Projects</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
              <select
                className="bg-neutral-300 text-neutral-900 p-1 rounded-lg "
                value={selectedUser}
                onChange={(e) =>
                  setSelectedUser(
                    e.target.value === "ALL" ? "ALL" : Number(e.target.value)
                  )
                }
              >
                <option value="ALL">All Users</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
            </>
          )}
          <select
            className="bg-neutral-300 text-neutral-900 p-1 rounded-lg "
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as any)}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Done</option>
          </select>
        </div>
      </div>
      <hr className="border-neutral-600 my-4 mb-6" />

      {/* Task Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6  ">
        {filteredTasks.map((task) => {
          const project = projects.find((p) => p.id === task.projectId);
          const daysLeft = task.deadline ? getDaysLeft(task.deadline) : null;
          const deadlineColor =
            daysLeft !== null ? getDeadlineColor(daysLeft) : "";
          const statusColor = getStatusColor(task.status);

          const reportsForTask = taskReports[task.id] || [];
          const unseenCount = reportsForTask.filter((r) => !r.seen).length;
          const reportBadgeColor =
            unseenCount > 0 ? "bg-red-600" : "bg-neutral-600 shadow-xl";
          const deadlineBadgeColor =
            task.status === "DONE"
              ? "bg-green-600" // Green if completed
              : daysLeft !== null
              ? getDeadlineColor(daysLeft) // Normal logic for pending/in-progress
              : "";

          const isProjectFinished = project?.finished;

          return (
            <div
              key={task.id}
              className="relative bg-neutral-900 border border-neutral-700 p-5 rounded-xl shadow-md flex flex-col gap-3 cursor-pointer"
              onClick={() => handleOpenTaskDetail(task)}
            >
              {/* Deadline Badge */}
              {task.deadline && daysLeft !== null && (
                <div
                  className={`absolute -top-3 right-5 ${deadlineBadgeColor} text-white text-xs font-semibold px-3 py-1 rounded-full`}
                >
                  {task.status === "DONE"
                    ? "Completed on schedule"
                    : daysLeft > 0
                    ? `${daysLeft} days left`
                    : "Deadline Passed"}
                </div>
              )}

              {/* Report Badge */}
              {user?.role === "ADMIN" && reportsForTask.length > 0 && (
                <div
                  className={`absolute -top-3 -right-2 ${reportBadgeColor} text-white text-xs font-semibold px-2 py-1 rounded-full`}
                >
                  {reportsForTask.length}
                </div>
              )}

              {/* Title */}
              {/* Title + Status */}
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">{task.title}</h3>

                {/* Status next to title */}
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
                >
                  {task.status.replace("_", " ")}
                </span>
              </div>

              {/* Divider */}
              <div className="w-12 h-0.5 bg-neutral-700"></div>
              {/* Status Update Dropdown for Assignee */}
              {user?.role === "MEMBER" &&
                !isProjectFinished &&
                task.status !== "DONE" && (
                  <div className="mt-1 mb-2">
                    <label className="text-xs text-neutral-500">
                      Update Status:
                    </label>

                    <div
                      className="relative"
                      onClick={(e) => e.stopPropagation()} // completely blocks card click
                    >
                      <select
                        className="w-full mt-1 bg-neutral-800 border border-neutral-700 rounded-lg text-sm p-2 text-white"
                        value={task.status}
                        onChange={async (e) => {
                          const newStatus = e.target.value;
                          await api.put(`/tasks/${task.id}/status`, {
                            status: newStatus,
                          });
                          fetchTasks();
                        }}
                      >
                        <option value="PENDING">Pending</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="DONE">Done</option>
                      </select>
                    </div>
                  </div>
                )}

              {/* Status Badge */}
              {/* <div
                className={`inline-block w-2/3 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}
              >
                {task.status.replace("_", " ")}
              </div> */}

              {/* Task Info */}
              <p className="text-neutral-300 text-sm">
                <span className="font-medium text-neutral-500">
                  Assigned To:
                </span>{" "}
                {task.assignee?.name || "Unassigned"}
              </p>

              <p className="text-neutral-300 text-sm">
                <span className="font-medium text-neutral-500">
                  In Project:
                </span>{" "}
                {project?.name || "Unknown Project"}
              </p>

              {/* Deadline Date */}
              {task.deadline && (
                <div className="flex  justify-end">
                  <p className="text-neutral-400 text-xs ">
                    Deadline: {new Date(task.deadline).toLocaleDateString()}
                  </p>
                </div>
              )}
              {/* Buttons for Admin */}
              {user?.role === "ADMIN" && (
                <div className="flex gap-3 pt-3 mt-2 border-t justify-end border-neutral-700">
                  <button
                    className="p-2 rounded bg-neutral-800 hover:bg-neutral-700  "
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent card click opening modal
                      setEditingTask(task);
                    }}
                    title="Edit task"
                  >
                    <Edit size={18} />
                  </button>

                  <button
                    className="p-2 rounded bg-neutral-800 hover:bg-neutral-700 "
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingTask(task);
                    }}
                    title="Delet task"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex flex-col bg-neutral-700/0   h-[60px] overflow-y-auto"></div>

      <AnimatePresence>
        {taskDetail && user && (
          <TaskDetailModal
            task={taskDetail}
            user={user}
            onClose={() => setTaskDetail(null)}
          />
        )}
      </AnimatePresence>

      {/* EDIT MODAL */}
      <AnimatePresence>
        {editingTask && (
          <EditTaskModal
            task={editingTask}
            users={users}
            projects={projects}
            onClose={() => setEditingTask(null)}
            onSaved={() => {
              setEditingTask(null);
              fetchTasks();
            }}
          />
        )}
      </AnimatePresence>

      {/* DELETE MODAL */}
      <AnimatePresence>
        {deletingTask && (
          <DeleteTaskModal
            task={deletingTask}
            onClose={() => setDeletingTask(null)}
            onDeleted={() => {
              setDeletingTask(null);
              fetchTasks();
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
