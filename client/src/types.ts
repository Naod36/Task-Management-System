export interface Task {
  id: number;
  title: string;
  description?: string;
  status: "PENDING" | "IN_PROGRESS" | "DONE";
  deadline?: string;
  projectId: number;
  project?: { id: number; name: string };
  assigneeId?: number | null;
  assignee?: { id: number; name: string };
}
export interface Project {
  id: number;
  name: string;
  description?: string | null;
  deadline?: string | null;
  tasks: Task[];
  finished?: boolean;
}
