// Dashboard.tsx
import { useEffect, useState } from "react";
import api from "../services/api";
import { motion, AnimatePresence } from "framer-motion";
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
  Save,
  Bell,
} from "lucide-react";
import TasksSection from "../components/TasksSection";
import UsersSection from "../components/UsersSection";
import type { Task, Project } from "../types";

import NotificationSection from "../components/NotificationSection";

interface DashboardProps {
  onLogout: () => void;
}

type TaskStatus = "PENDING" | "IN_PROGRESS" | "DONE";

interface UserItem {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
}
interface User {
  id: number;
  name: string;
  email: string;
  role: "ADMIN" | "MEMBER";
}
interface Notification {
  id: number;

  message: string;
  read: boolean;
  createdAt: string;
}
export default function Dashboard({ onLogout }: DashboardProps) {
  const [user, setUser] = useState<any | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [users, setUsers] = useState<UserItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(true);
  const [currentView, setCurrentView] = useState<
    "projects" | "tasks" | "users" | "notifications"
  >("projects");

  // Modals / selection
  const [selectedProject, setSelectedProject] = useState<Project | null>(null); // view details
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [showCreateTaskModal, setShowCreateTaskModal] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // Create / Edit form state
  const emptyForm = {
    name: "",
    description: "",
    deadline: "",
    tasks: [] as {
      title: string;
      description?: string;
      assigneeId?: number | null;
      status?: TaskStatus;
      deadline?: string | null;
    }[],
  };
  const [taskFormData, setTaskFormData] = useState<{
    title: string;
    description: string;
    status: TaskStatus;
    assigneeId: number | null;
    projectId: number | null;
    deadline: string | null;
  }>({
    title: "",
    description: "",
    status: "PENDING",
    assigneeId: null,
    projectId: null,
    deadline: null,
  });
  const [formData, setFormData] = useState(() => ({ ...emptyForm }));

  const [deletedTaskIds, setDeletedTaskIds] = useState<number[]>([]);

  const [notifications, setNotifications] = useState<Notification[]>([]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Fetching
  useEffect(() => {
    fetchUser();
    fetchUsers();
    fetchTasks();
    fetchProjects();
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  // Ensure your api instance looks something like this
  api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token"); // Or wherever you store your JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });
  const fetchNotifications = async () => {
    try {
      const { data } = await api.get<Notification[]>("/notifications");
      setNotifications(data);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };
  const markAsRead = async (id: number) => {
    try {
      await api.put(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error(err);
    }
  };
  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };
  async function fetchUser() {
    try {
      const token = localStorage.getItem("token");
      console.log("Token in localStorage:", localStorage.getItem("token"));

      const res = await api.get("/users/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUser(res.data);
      console.log(res.data);
    } catch (err) {
      console.log("Not authorized or no /users/me", err);
    }
  }

  async function fetchUsers() {
    try {
      const res = await api.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.log("Could not fetch users", err);
    }
  }
  const fetchTasks = async () => {
    try {
      const res = await api.get("/tasks");
      setTasks(res.data);
    } catch (err) {
      console.error("Failed to fetch tasks", err);
    }
  };

  async function fetchProjects() {
    try {
      const res = await api.get("/projects");
      // Ensure tasks is always an array
      const cleaned: Project[] = res.data.map((p: any) => ({
        ...p,
        tasks: p.tasks || [],
      }));
      setProjects(cleaned);
    } catch (err) {
      console.log("Could not fetch projects", err);
    }
  }

  // helpers
  const calculateCompletion = (tasks: Task[] = []) => {
    if (!tasks || tasks.length === 0) return 0;
    const doneTasks = tasks.filter((t) => t.status === "DONE").length;
    return Math.round((doneTasks / tasks.length) * 100);
  };

  const uniqueMembers = (tasks: Task[] = []) => {
    const members = tasks.map((t) => t.assignee?.name).filter(Boolean);
    return Array.from(new Set(members));
  };

  const completedProjects = projects.filter(
    (p) => calculateCompletion(p.tasks) === 100
  ).length;

  const inProgressProjects = projects.filter((p) => {
    const c = calculateCompletion(p.tasks);
    return c > 0 && c < 100;
  }).length;

  const userTasks = tasks.filter((t) => t.assigneeId === user?.id);

  const completedTasks = userTasks.filter((t) => t.status === "DONE").length;
  const inProgressTasks = userTasks.filter(
    (t) => t.status === "IN_PROGRESS"
  ).length;
  const pendingTasks = userTasks.filter((t) => t.status === "PENDING").length;

  // ---------- Create project flows ----------
  const addCreateTaskRow = () => {
    setFormData((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        { title: "", description: "", assigneeId: null, status: "PENDING" },
      ],
    }));
  };

  const updateCreateTaskRow = (index: number, patch: Partial<any>) => {
    setFormData((s) => {
      const tasks = [...s.tasks];
      tasks[index] = { ...tasks[index], ...patch };
      return { ...s, tasks };
    });
  };

  const removeCreateTaskRow = (index: number) => {
    setFormData((s) => {
      const tasks = [...s.tasks];
      tasks.splice(index, 1);
      return { ...s, tasks };
    });
  };

  const submitCreateProject = async () => {
    try {
      // Prepare payload: project data plus nested tasks.create array
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
      };

      if (formData.tasks.length > 0) {
        payload.tasks = {
          create: formData.tasks.map((t) => ({
            title: t.title,
            description: t.description || undefined,
            status: t.status || "PENDING",
            deadline: t.deadline
              ? new Date(t.deadline).toISOString()
              : undefined,
            assigneeId: t.assigneeId || undefined,
          })),
        };
      }

      await api.post("/projects", payload);
      setShowCreateModal(false);
      setFormData({ ...emptyForm });
      fetchProjects();
    } catch (err) {
      console.error("Create project failed", err);
      alert("Failed to create project");
    }
  };

  // ---------- Edit project flows (including task delete/create) ----------
  const openEditModal = (project: Project) => {
    // prefill formData with project and existing tasks as create-like rows for new tasks,
    // but keep existing tasks separately and let user delete them (we track deleted IDs)
    setEditingProject(project);
    setDeletedTaskIds([]);
    setFormData({
      name: project.name || "",
      description: project.description || "",
      deadline: project.deadline ? project.deadline.split("T")[0] : "",
      tasks: project.tasks
        ? project.tasks.map((t) => ({
            // keep id in UI list but treat existing tasks specially
            id: t.id,
            title: t.title,
            description: t.description || "",
            assigneeId: t.assignee?.id ?? null,
            status: t.status ?? "PENDING",
            deadline: t.deadline ? t.deadline.split("T")[0] : null,
          }))
        : [],
    } as any);
    setShowEditModal(true);
  };

  const addEditTaskRow = () => {
    setFormData((s) => ({
      ...s,
      tasks: [
        ...s.tasks,
        { title: "", description: "", assigneeId: null, status: "PENDING" },
      ],
    }));
  };

  const removeEditTaskRow = (index: number) => {
    const row = formData.tasks[index];
    // if this row has an id -> existing task: mark it deleted
    if ((row as any).id) {
      setDeletedTaskIds((d) => [...d, (row as any).id]);
    }
    // remove from UI list
    setFormData((s) => {
      const tasks = [...s.tasks];
      tasks.splice(index, 1);
      return { ...s, tasks };
    });
  };

  const updateEditTaskRow = (index: number, patch: Partial<any>) => {
    setFormData((s) => {
      const tasks = [...s.tasks];
      tasks[index] = { ...tasks[index], ...patch };
      return { ...s, tasks };
    });
  };

  const submitEditProject = async () => {
    if (!editingProject) return;
    try {
      const payload: any = {
        name: formData.name,
        description: formData.description || undefined,
        deadline: formData.deadline
          ? new Date(formData.deadline).toISOString()
          : undefined,
      };

      const createTasks = formData.tasks
        .filter((t: any) => !t.id)
        .map((t: any) => ({
          title: t.title,
          description: t.description || undefined,
          status: t.status || "PENDING",
          deadline: t.deadline ? new Date(t.deadline).toISOString() : undefined,
          assigneeId: t.assigneeId || undefined,
        }));
      const updateTasks = formData.tasks
        .filter((t: any) => t.id)
        .map((t: any) => ({
          id: t.id,
          title: t.title,
          description: t.description || undefined,
          status: t.status || "PENDING",
          deadline: t.deadline ? new Date(t.deadline).toISOString() : undefined,
          assigneeId: t.assigneeId || undefined,
        }));

      payload.tasks = {
        delete: deletedTaskIds.length > 0 ? deletedTaskIds : undefined,
        create: createTasks.length > 0 ? createTasks : undefined,
        update: updateTasks.length > 0 ? updateTasks : undefined,
      };

      await api.put(`/projects/${editingProject.id}`, payload);
      setShowEditModal(false);
      setEditingProject(null);
      setDeletedTaskIds([]);
      setFormData({ ...emptyForm });
      fetchProjects();
    } catch (err) {
      console.error("Edit project failed", err);
      alert("Failed to update project");
    }
  };

  const deleteProject = async (id: number) => {
    try {
      await api.delete(`/projects/${id}`);
      fetchProjects();
      setSelectedProject(null);
    } catch (err) {
      console.error("Delete failed", err);
      alert("Failed to delete project");
    }
  };
  const submitCreateTask = async () => {
    try {
      if (!taskFormData.projectId) {
        alert("Please select a project");
        return;
      }

      const payload = {
        title: taskFormData.title,
        description: taskFormData.description || undefined,
        status: taskFormData.status || "PENDING",
        assigneeId: taskFormData.assigneeId || undefined,
        deadline: taskFormData.deadline
          ? new Date(taskFormData.deadline).toISOString()
          : undefined,
        projectId: taskFormData.projectId,
      };

      await api.post("/tasks", payload); // make sure you have a /tasks endpoint
      setShowCreateTaskModal(false);
      setTaskFormData({
        title: "",
        description: "",
        status: "PENDING",
        assigneeId: null,
        projectId: null,
        deadline: "",
      });
      fetchTasks(); // refresh tasks list
    } catch (err) {
      console.error("Create task failed", err);
      alert("Failed to create task");
    }
  };

  // Days left for projects
  const getProjectDaysLeft = (deadline: string | Date) => {
    const today = new Date();
    const end = new Date(deadline);
    const diff = end.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getProjectDeadlineColor = (daysLeft: number) => {
    if (daysLeft > 7) return "bg-green-600";
    if (daysLeft > 3) return "bg-yellow-500";
    if (daysLeft >= 0) return "bg-red-600";
    return "bg-gray-700"; // past deadline
  };
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
  // Render
  return (
    <div className="flex h-screen bg-neutral-800 text-neutral-100">
      {/* Sidebar */}
      <div
        className={`bg-neutral-900 shadow-xl p-4 flex flex-col ${
          sidebarOpen ? "w-64" : "w-16"
        } transition-all duration-300`}
      >
        <div className="flex items-center justify-between mb-6">
          {sidebarOpen && <h2 className="text-xl font-bold">Task Manager</h2>}
          <button
            className="p-2 rounded-lg hover:bg-neutral-800"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {/* Nav buttons wrapper */}
        <div className="flex flex-col grow justify-between">
          <div className="flex flex-col gap-3">
            <button
              className={`flex items-center gap-2 p-2 rounded-md ${
                currentView === "projects"
                  ? "bg-neutral-800 shadow-md"
                  : "hover:bg-neutral-800"
              }`}
              onClick={() => setCurrentView("projects")}
            >
              <CodeXml size={18} /> {sidebarOpen && "Projects"}
            </button>
            {user?.role === "MEMBER" && (
              <button
                className={`flex items-center gap-2 p-2 rounded-md ${
                  currentView === "tasks"
                    ? "bg-neutral-800 shadow-md"
                    : "hover:bg-neutral-800"
                }`}
                onClick={() => setCurrentView("tasks")}
              >
                <CircleCheckBig size={18} /> {sidebarOpen && "My Tasks"}
              </button>
            )}
            {user?.role === "ADMIN" && (
              <button
                className={`flex items-center gap-2 p-2 rounded-md ${
                  currentView === "tasks"
                    ? "bg-neutral-800 shadow-md"
                    : "hover:bg-neutral-800"
                }`}
                onClick={() => setCurrentView("tasks")}
              >
                <CircleCheckBig size={18} /> {sidebarOpen && "Tasks"}
              </button>
            )}

            {user?.role === "ADMIN" && (
              <button
                className={`flex items-center gap-2 p-2 rounded-md ${
                  currentView === "users"
                    ? "bg-neutral-800 shadow-md"
                    : "hover:bg-neutral-800"
                }`}
                onClick={() => setCurrentView("users")}
              >
                <User size={18} /> {sidebarOpen && "Users"}
              </button>
            )}
            <button
              onClick={() => setCurrentView("notifications")}
              className={`flex items-center gap-2 p-2 rounded-md ${
                currentView === "notifications"
                  ? "bg-neutral-200 text-neutral-900"
                  : "bg-neutral-800"
              }`}
            >
              <Bell size={18} /> {sidebarOpen && "Notifications"}
              {/* {notifications.filter((n) => !n.read).length > 0 && (
                <span className=" w-5 h-5 text-xs bg-red-600 text-white rounded-full flex items-center justify-center">
                  {notifications.filter((n) => !n.read).length}
                </span>
              )} */}
            </button>
          </div>

          {/* Logout at the bottom */}
          <button
            className="flex items-center gap-2 p-2 rounded-md hover:bg-red-600 mt-4"
            onClick={onLogout}
          >
            <LogOut size={18} /> {sidebarOpen && "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-6">
        {/* Floating Action Button */}
        <div className="fixed bottom-8 right-12 flex flex-row  items-end gap-2 z-50">
          {fabOpen && user?.role === "ADMIN" && (
            <div className="flex flex-col mb-2 gap-2 p-2 rounded-lg items-center transition-all">
              <button
                className="bg-amber-400 text-neutral-900 px-4 py-2 rounded-lg hover:bg-neutral-200 flex items-center gap-2  hover:scale-110 transition-all"
                onClick={() => {
                  setFormData({ ...emptyForm });
                  setShowCreateModal(true);
                  setFabOpen(false);
                }}
              >
                <Plus size={16} /> Project
              </button>
              {/* <div className="w-24 h-0.5 flex justify-center items-center bg-neutral-300"></div> */}

              <button
                className="bg-amber-400 text-neutral-900  px-4 py-2 rounded-lg hover:bg-neutral-200 flex items-center gap-2  hover:scale-110 transition-all"
                onClick={() => {
                  setShowCreateTaskModal(true);
                  setFabOpen(false);
                }}
              >
                <Plus size={16} /> Task
              </button>
            </div>
          )}

          {/* Main FAB Button */}
          {user?.role === "ADMIN" && (
            <button
              className="bg-neutral-200 w-14 h-14 rounded-full flex items-center justify-center text-neutral-900 shadow-lg  hover:scale-110 transition-all"
              onClick={() => setFabOpen((prev) => !prev)}
            >
              <Plus size={24} />
            </button>
          )}
        </div>
        <div className="flex justify-between items-center p-4 bg-neutral-900 rounded-xl shadow-md ">
          <h1 className="text-2xl font-bold">Dashboard</h1>

          <div className="relative flex flex-row items-center">
            <h1 className="text-xl font-bold ">
              Welcome {user?.name || "User"}
              {user?.role === "ADMIN" && (
                <span className="text-xs  bg-neutral-700 text-neutral-200 px-2 py-1 ml-2 items-center rounded">
                  ADMIN
                </span>
              )}
            </h1>
            <button
              className="relative p-2 rounded hover:bg-neutral-800 ml-6"
              onClick={() => setCurrentView("notifications")}
            >
              <Bell size={24} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 text-xs bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* {showNotifications && (
              <div className="absolute right-0 mt-20 w-80 z-50">
                <NotificationSection
                  notifications={notifications}
                  markAsRead={markAsRead}
                />
              </div>
            )} */}
          </div>
        </div>

        <hr className="border-neutral-600 my-4" />

        <div className="flex flex-row gap-4 bg-neutral-600 rounded-xl shadow-md justify-center mb-6">
          {/* Collective Status */}
          <div className=" p-4 ">
            <h3 className="text-lg font-semibold text-neutral-200 mb-3 text-center">
              Collective Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              {/* Total Projects */}
              <div className="bg-neutral-900 p-5 rounded-xl shadow-md flex flex-col items-center">
                <h3 className="text-2xl font-bold">{projects.length}</h3>
                <div className="w-full h-0.5 bg-neutral-800 my-2"></div>
                <p className="text-neutral-200 text-sm">Total Projects </p>
              </div>

              {/* Projects In Progress */}
              <div className="bg-neutral-900 p-5 rounded-xl shadow-md flex flex-col items-center">
                <h3 className="text-2xl font-bold">{inProgressProjects}</h3>
                <div className="w-full h-0.5 bg-neutral-800 my-2"></div>
                <p className="text-neutral-200 text-sm">Projects In Progress</p>
              </div>

              {/* Projects Completed */}
              <div className="bg-neutral-900 p-5 rounded-xl shadow-md flex flex-col items-center">
                <h3 className="text-2xl font-bold">{completedProjects}</h3>
                <div className="w-full h-0.5 bg-neutral-800 my-2"></div>
                <p className="text-neutral-200 text-sm">Projects Completed</p>
              </div>
            </div>
          </div>

          {/* Personal Status */}
          <div className="p-4 ">
            <h3 className="text-lg font-semibold text-neutral-200 mb-3 text-center">
              Personal Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-center">
              {/* Tasks Pending */}
              <div className="bg-neutral-900 p-5 rounded-xl shadow-md flex flex-col items-center">
                <h3 className="text-2xl font-bold">{pendingTasks}</h3>
                <div className="w-full h-0.5 bg-neutral-800 my-2"></div>
                <p className="text-neutral-200 text-sm">Tasks Pending</p>
              </div>

              {/* Tasks In Progress */}
              <div className="bg-neutral-900 p-5 rounded-xl shadow-md flex flex-col items-center">
                <h3 className="text-2xl font-bold">{inProgressTasks}</h3>
                <div className="w-full h-0.5 bg-neutral-800 my-2"></div>
                <p className="text-neutral-200 text-sm">Tasks In Progress</p>
              </div>

              {/* Tasks Completed */}
              <div className="bg-neutral-900 p-5 rounded-xl shadow-md flex flex-col items-center">
                <h3 className="text-2xl font-bold">{completedTasks}</h3>
                <div className="w-full h-0.5 bg-neutral-800 my-2"></div>
                <p className="text-neutral-200 text-sm">Tasks Completed</p>
              </div>
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {currentView === "projects" && (
          <>
            <div className="flex flex-col gap-2 p-4 bg-neutral-700/40 rounded-xl shadow-md max-h-auto overflow-y-auto">
              {/* Title */}
              <div className="flex justify-between items-center  ">
                <h2 className="text-xl font-bold">Projects</h2>
              </div>
              <hr className="border-neutral-600 my-4 mb-6" />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ">
                {projects.map((project) => {
                  const completion = calculateCompletion(project.tasks || []);
                  const members = uniqueMembers(project.tasks || []);

                  return (
                    <motion.div
                      layout
                      key={project.id}
                      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-md hover:shadow-lg transition-all cursor-pointer relative"
                      onClick={() => setSelectedProject(project)}
                    >
                      {/* Deadline Badge */}
                      {project.deadline && (
                        <div
                          className={`absolute -top-3 right-3 ${getProjectDeadlineColor(
                            getProjectDaysLeft(project.deadline)
                          )} text-white text-xs px-3 py-1 rounded-full shadow`}
                        >
                          {project.finished
                            ? "Completed on schedule"
                            : getProjectDaysLeft(project.deadline) > 0
                            ? `${getProjectDaysLeft(
                                project.deadline
                              )} days left`
                            : "Deadline Passed"}
                        </div>
                      )}

                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <h3 className="text-xl font-semibold text-white">
                            {project.name}
                          </h3>

                          <p className="text-sm text-neutral-400 line-clamp-2">
                            {project.description || (
                              <span className="italic text-neutral-600">
                                No description
                              </span>
                            )}
                          </p>
                        </div>

                        {/* Completion + Edit */}
                        <div className="flex flex-col items-end gap-2">
                          {user?.role === "ADMIN" && (
                            <button
                              className="p-2 rounded-lg hover:bg-neutral-800 transition"
                              onClick={(e) => {
                                e.stopPropagation();
                                openEditModal(project);
                              }}
                              title="Edit project"
                            >
                              <Edit size={18} />
                            </button>
                          )}
                          <span className="text-sm font-medium text-neutral-300">
                            {completion}%
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full bg-neutral-700/60 rounded-full h-2 mb-4">
                        <div
                          className="bg-amber-500 h-2 rounded-full transition-all"
                          style={{ width: `${completion}%` }}
                        />
                      </div>

                      {/* Stats */}
                      <div className="flex justify-between text-sm text-neutral-400 mb-4">
                        <span>{members?.length ?? 0} Members</span>
                        <span>{project.tasks?.length ?? 0} Tasks</span>
                      </div>

                      {/* Finish Button */}
                      {user?.role === "ADMIN" &&
                        !project.finished &&
                        completion === 100 && (
                          <button
                            onClick={async (e) => {
                              e.stopPropagation();
                              await api.put(`/projects/${project.id}/finish`);
                              fetchProjects();
                            }}
                            className="w-full bg-green-700 hover:bg-green-600 px-4 py-2 text-sm rounded-lg font-medium text-white shadow"
                          >
                            Mark as Complete
                          </button>
                        )}

                      {/* Finished Label */}
                      {project.finished && (
                        <div className="w-full bg-green-600/20 border border-green-600/40 text-green-400 px-4 py-2 text-sm rounded-lg font-medium text-center shadow">
                          ✔ Project Completed
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
              <div className="flex flex-col bg-neutral-700/0   h-[60px] overflow-y-auto"></div>
            </div>
          </>
        )}
        {currentView === "tasks" && (
          <TasksSection
            tasks={tasks}
            users={users}
            projects={projects}
            fetchTasks={fetchTasks}
          />
        )}

        {currentView === "users" && (
          <UsersSection users={users} fetchUsers={fetchUsers} />
        )}
        {currentView === "notifications" && (
          <NotificationSection
            notifications={notifications}
            markAsRead={markAsRead}
            markAllAsRead={markAllAsRead}
          />
        )}
      </div>

      {/* AnimatePresence for modals */}
      <AnimatePresence>
        {/* Create Modal */}
        {showCreateModal && (
          <motion.div
            onClick={() => setShowCreateModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Create Project</h2>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="p-2 rounded hover:bg-neutral-700"
                  >
                    <X />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    className="w-full p-2 rounded bg-neutral-700"
                    placeholder="Project Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />

                  <textarea
                    className="w-full p-2 rounded bg-neutral-700"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />

                  <input
                    type="date"
                    className="w-1/4 p-2 items-center rounded bg-neutral-700"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    min={getTomorrowDate()}
                  />

                  <div className="border-t border-neutral-700 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Tasks</h3>
                      <button
                        className="flex items-center gap-2 px-3 py-1 bg-neutral-700 rounded hover:bg-neutral-600 hover:scale-110 transition-all"
                        onClick={addCreateTaskRow}
                      >
                        <Plus size={14} /> Add Task
                      </button>
                    </div>

                    {formData.tasks.length === 0 && (
                      <p className="text-neutral-400 text-sm">
                        No tasks yet — add tasks if you want.
                      </p>
                    )}

                    <div className="space-y-2">
                      {formData.tasks.map((t, i) => (
                        <div key={i} className="bg-neutral-700 p-3 rounded">
                          <div className="flex gap-2">
                            <input
                              className="flex-1 p-2 rounded bg-neutral-800"
                              placeholder="Task title"
                              value={t.title}
                              onChange={(e) =>
                                updateCreateTaskRow(i, {
                                  title: e.target.value,
                                })
                              }
                            />
                            <select
                              value={t.assigneeId ?? ""}
                              onChange={(e) =>
                                updateCreateTaskRow(i, {
                                  assigneeId: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                              className="p-2 rounded bg-neutral-800"
                            >
                              <option value="">Unassigned</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>

                            <select
                              value={t.status || "PENDING"}
                              onChange={(e) =>
                                updateCreateTaskRow(i, {
                                  status: e.target.value as TaskStatus,
                                })
                              }
                              className="p-2 rounded bg-neutral-800"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="DONE">DONE</option>
                            </select>

                            <button
                              className="p-2 rounded hover:bg-neutral-600"
                              onClick={() => removeCreateTaskRow(i)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <input
                            className="w-full mt-2 p-2 rounded bg-neutral-800"
                            placeholder="Task description (optional)"
                            value={t.description ?? ""}
                            onChange={(e) =>
                              updateCreateTaskRow(i, {
                                description: e.target.value,
                              })
                            }
                          />

                          <input
                            type="date"
                            className="w-1/4 mt-2 p-2 rounded bg-neutral-800"
                            value={t.deadline ?? ""}
                            onChange={(e) =>
                              updateCreateTaskRow(i, {
                                deadline: e.target.value || null,
                              })
                            }
                            min={getTomorrowDate()}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 rounded hover:scale-110 transition-all"
                      onClick={() => {
                        setShowCreateModal(false);
                        setFormData({ ...emptyForm });
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-neutral-900 bg-neutral-100 rounded flex flex-row gap-2 items-center hover:bg-neutral-300 hover:shadow-xl hover:scale-110 transition-all"
                      onClick={submitCreateProject}
                    >
                      <Save size={18} />
                      Save Project
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingProject && (
          <motion.div
            onClick={() => {
              setShowEditModal(false);
              setEditingProject(null);
              setDeletedTaskIds([]);
            }}
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
              className="bg-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Edit Project</h2>
                  <button
                    className="p-2 rounded hover:bg-neutral-700"
                    onClick={() => {
                      setShowEditModal(false);
                      setEditingProject(null);
                      setDeletedTaskIds([]);
                    }}
                  >
                    <X />
                  </button>
                </div>

                <div className="space-y-3">
                  <input
                    className="w-full p-2 rounded bg-neutral-700"
                    placeholder="Project Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />

                  <textarea
                    className="w-full p-2 rounded bg-neutral-700"
                    placeholder="Description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                  />

                  <input
                    type="date"
                    className="w-1/4 p-2 rounded bg-neutral-700"
                    value={formData.deadline}
                    onChange={(e) =>
                      setFormData({ ...formData, deadline: e.target.value })
                    }
                    min={getTomorrowDate()}
                  />

                  <div className="border-t border-neutral-700 pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-semibold">Tasks</h3>
                      <button
                        className="flex items-center gap-2 px-3 py-1 bg-neutral-700 rounded hover:bg-neutral-600 hover:scale-110 transition-all"
                        onClick={addEditTaskRow}
                      >
                        <Plus size={14} /> New Task
                      </button>
                    </div>

                    {formData.tasks.length === 0 && (
                      <p className="text-neutral-400 text-sm">
                        No tasks on this project.
                      </p>
                    )}

                    <div className="space-y-2">
                      {formData.tasks.map((t: any, i: number) => (
                        <div
                          key={i}
                          className="bg-neutral-700 p-3 rounded relative"
                        >
                          {/* show a small badge if this is an existing task */}
                          {t.id && (
                            <div className="absolute -top-2 -left-2 text-xs bg-amber-600 px-2 rounded">
                              existing
                            </div>
                          )}
                          <div className="flex gap-2">
                            <input
                              className="flex-1 p-2 rounded bg-neutral-800"
                              placeholder="Task title"
                              value={t.title}
                              onChange={(e) =>
                                updateEditTaskRow(i, { title: e.target.value })
                              }
                            />

                            <select
                              value={t.assigneeId ?? ""}
                              onChange={(e) =>
                                updateEditTaskRow(i, {
                                  assigneeId: e.target.value
                                    ? Number(e.target.value)
                                    : null,
                                })
                              }
                              className="p-2 rounded bg-neutral-800"
                            >
                              <option value="">Unassigned</option>
                              {users.map((u) => (
                                <option key={u.id} value={u.id}>
                                  {u.name}
                                </option>
                              ))}
                            </select>

                            <select
                              value={t.status ?? "PENDING"}
                              onChange={(e) =>
                                updateEditTaskRow(i, {
                                  status: e.target.value as TaskStatus,
                                })
                              }
                              className="p-2 rounded bg-neutral-800"
                            >
                              <option value="PENDING">PENDING</option>
                              <option value="IN_PROGRESS">IN_PROGRESS</option>
                              <option value="DONE">DONE</option>
                            </select>

                            <button
                              className="p-2 rounded hover:bg-neutral-600"
                              onClick={() => removeEditTaskRow(i)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>

                          <input
                            className="w-full mt-2 p-2 rounded bg-neutral-800"
                            placeholder="Task description (optional)"
                            value={t.description ?? ""}
                            onChange={(e) =>
                              updateEditTaskRow(i, {
                                description: e.target.value,
                              })
                            }
                          />

                          <input
                            type="date"
                            className="w-1/4 mt-2 p-2 rounded bg-neutral-800"
                            value={t.deadline ?? ""}
                            onChange={(e) =>
                              updateEditTaskRow(i, {
                                deadline: e.target.value || null,
                              })
                            }
                            min={getTomorrowDate()}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <div>
                      {deletedTaskIds.length > 0 && (
                        <p className="text-sm text-amber-400">
                          {deletedTaskIds.length} task(s) will be deleted.
                        </p>
                      )}
                    </div>

                    <div className="flex gap-3">
                      <button
                        className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 rounded hover:scale-110 transition-all"
                        onClick={() => {
                          setShowEditModal(false);
                          setEditingProject(null);
                          setDeletedTaskIds([]);
                          setFormData({ ...emptyForm });
                        }}
                      >
                        Cancel
                      </button>

                      <button
                        className="px-4 py-2 text-neutral-900 bg-neutral-100 rounded flex flex-row gap-2 items-center hover:bg-neutral-300 hover:shadow-xl hover:scale-110 transition-all"
                        onClick={submitEditProject}
                      >
                        {" "}
                        <Save size={18} />
                        Save Changes
                      </button>

                      <button
                        className="px-4 py-2 bg-red-600 hover:bg-red-500 rounded hover:scale-110 transition-all"
                        onClick={() => {
                          editingProject &&
                            setSelectedUserId(editingProject.id);
                          setShowDeleteModal(true);
                          setShowEditModal(false);
                        }}
                      >
                        Delete Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.15 }}
              className="bg-neutral-900 p-6 rounded-xl shadow-xl w-100 border border-neutral-700"
            >
              {" "}
              <h3 className="text-lg font-bold mb-2 text-red-400">
                Delete User
              </h3>
              <p className="text-neutral-300 mb-2">
                Are you sure you want to delete this Project?
              </p>
              <p className="text-neutral-500 text-xs mb-4">
                This action is irreversible
              </p>
              <div className="flex justify-end gap-3">
                <button
                  className="px-4 py-2 rounded-lg bg-neutral-700 hover:bg-neutral-600"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Cancel
                </button>

                <button
                  className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 font-semibold"
                  onClick={async () => {
                    if (selectedUserId) {
                      await deleteProject(selectedUserId);
                    }
                    setShowDeleteModal(false);
                  }}
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showCreateTaskModal && (
          <motion.div
            onClick={() => setShowCreateTaskModal(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-neutral-800 rounded-xl w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-xl"
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Create Task</h2>
                  <button
                    onClick={() => setShowCreateTaskModal(false)}
                    className="p-2 rounded hover:bg-neutral-700"
                  >
                    <X />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Project selector */}
                  <select
                    value={taskFormData.projectId ?? ""}
                    onChange={(e) =>
                      setTaskFormData((s) => ({
                        ...s,
                        projectId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    className="w-full p-2 rounded bg-neutral-700"
                  >
                    <option value="">Select Project</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>

                  {/* Task Title */}
                  <input
                    className="w-full p-2 rounded bg-neutral-700"
                    placeholder="Task Title"
                    value={taskFormData.title}
                    onChange={(e) =>
                      setTaskFormData((s) => ({ ...s, title: e.target.value }))
                    }
                  />

                  {/* Task Description */}
                  <textarea
                    className="w-full p-2 rounded bg-neutral-700"
                    placeholder="Description"
                    value={taskFormData.description}
                    onChange={(e) =>
                      setTaskFormData((s) => ({
                        ...s,
                        description: e.target.value,
                      }))
                    }
                  />

                  {/* Status */}
                  <select
                    value={taskFormData.status}
                    onChange={(e) =>
                      setTaskFormData((s) => ({
                        ...s,
                        status: e.target.value as TaskStatus,
                      }))
                    }
                    className="max-w-1/3 mr-2 p-2 rounded bg-neutral-700"
                  >
                    <option value="PENDING">PENDING</option>
                    <option value="IN_PROGRESS">IN_PROGRESS</option>
                    <option value="DONE">DONE</option>
                  </select>

                  {/* Assignee */}
                  <select
                    value={taskFormData.assigneeId ?? ""}
                    onChange={(e) =>
                      setTaskFormData((s) => ({
                        ...s,
                        assigneeId: e.target.value
                          ? Number(e.target.value)
                          : null,
                      }))
                    }
                    className="max-w-1/3 mr-2 p-2 rounded bg-neutral-700"
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>

                  {/* Deadline */}
                  <input
                    type="date"
                    className="max-w-1/3 mr-2 p-2 rounded bg-neutral-700"
                    value={taskFormData.deadline ?? ""}
                    onChange={(e) =>
                      setTaskFormData((s) => ({
                        ...s,
                        deadline: e.target.value || null,
                      }))
                    }
                    min={getTomorrowDate()}
                  />

                  <div className="flex justify-end gap-3 mt-4">
                    <button
                      className="px-4 py-2 bg-neutral-950 hover:bg-neutral-900 rounded hover:scale-110 transition-all"
                      onClick={() => setShowCreateTaskModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      className="px-4 py-2 text-neutral-900 bg-neutral-100 rounded flex flex-row gap-2 items-center hover:bg-neutral-300 hover:shadow-xl hover:scale-110 transition-all"
                      onClick={submitCreateTask}
                    >
                      {" "}
                      <Save size={18} />
                      Save Task
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Details Modal */}
        {selectedProject && (
          <motion.div
            onClick={() => {
              setSelectedProject(null);
            }}
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
              className="bg-neutral-800 rounded-xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-xl"
            >
              <div className="p-6 overflow-y-auto max-h-[90vh]">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold">{selectedProject.name}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      className="p-2 rounded hover:bg-neutral-700"
                      onClick={() => {
                        setSelectedProject(null);
                      }}
                    >
                      <X />
                    </button>
                  </div>
                </div>

                {selectedProject.description && (
                  <p className="text-neutral-300 mb-4">
                    {selectedProject.description}
                  </p>
                )}

                {selectedProject.deadline && (
                  <p className="text-neutral-400 text-sm mb-6">
                    Deadline:{" "}
                    {new Date(selectedProject.deadline).toLocaleDateString()}
                  </p>
                )}

                <div className="mb-6">
                  <h3 className="font-semibold mb-2">Project Progress</h3>
                  <div className="bg-neutral-700 rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full"
                      style={{
                        width: `${calculateCompletion(selectedProject.tasks)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold mb-2">Tasks</h3>
                    <ul className="space-y-2">
                      {selectedProject.tasks.map((task) => (
                        <li
                          key={task.id}
                          className="flex justify-between bg-neutral-700 p-2 rounded-lg"
                        >
                          <div>
                            <div className="font-semibold">{task.title}</div>
                            <div className="text-xs text-neutral-400">
                              {task.description}
                            </div>
                            <div className="text-xs text-neutral-400">
                              {task.deadline
                                ? new Date(task.deadline).toLocaleDateString()
                                : null}
                            </div>
                          </div>
                          <div className="text-sm text-neutral-300">
                            <div>{task.status}</div>
                            <div className="text-xs text-neutral-400">
                              {task.assignee?.name ?? "Unassigned"}
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-2">Members</h3>
                    <ul className="space-y-2">
                      {uniqueMembers(selectedProject.tasks).length > 0 ? (
                        uniqueMembers(selectedProject.tasks).map((m, i) => (
                          <li key={i} className="bg-neutral-700 p-2 rounded-lg">
                            {m}
                          </li>
                        ))
                      ) : (
                        <p className="text-neutral-400 text-sm">
                          No members assigned
                        </p>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
