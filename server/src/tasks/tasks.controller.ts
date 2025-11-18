import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
} from '@nestjs/common';
import { TasksService } from './tasks.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { TaskReportsService } from './task-reports.service';

@Controller('tasks')
export class TasksController {
  constructor(
    private tasksService: TasksService,
    private taskReportsService: TaskReportsService,
  ) {}

  @Post()
  create(
    @Body()
    body: {
      title: string;
      description?: string;
      status?: 'PENDING' | 'IN_PROGRESS' | 'DONE';
      deadline?: string;
      projectId: number;
      assigneeId?: number;
    },
  ) {
    return this.tasksService.createTask(body);
  }
  @Post(':id/report')
  createReport(
    @Param('id', ParseIntPipe) taskId: number,
    @Body() body: { userId: number; message: string },
  ) {
    return this.taskReportsService.createReport(
      taskId,
      body.userId,
      body.message,
    );
  }
  @Get(':id/reports')
  getTaskReports(@Param('id', ParseIntPipe) taskId: number) {
    return this.taskReportsService.getReportsByTask(taskId);
  }
  // PUT /tasks/reports/:id/seen
  @Put('reports/:id/seen')
  markReportAsSeen(@Param('id', ParseIntPipe) id: number) {
    return this.taskReportsService.markAsSeen(id);
  }

  @Get()
  findAll() {
    return this.tasksService.getTasks();
  }
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.getTaskById(id);
  }

  @Put(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateTaskDto) {
    return this.tasksService.update(id, data);
  }

  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number) {
    return this.tasksService.deleteTask(id);
  }
  @Put(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: any) {
    return this.tasksService.updateTaskStatus(Number(id), body.status);
  }
}
