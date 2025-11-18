export class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
  deadline?: string;
  projectId?: number;
  assigneeId?: number | null;
}
