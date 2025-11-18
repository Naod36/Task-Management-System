import {
  Controller,
  Get,
  Post,
  Put,
  Req,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';

@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Post()
  create(@Body() body: any) {
    return this.projectsService.createProject(body);
  }

  @Get()
  findAll() {
    return this.projectsService.getProjects();
  }

  // Update Project
  @Put(':id')
  update(@Param('id') id: string, @Body() body: any) {
    return this.projectsService.updateProject(Number(id), body);
  }
  @Put(':id/finish')
  async finishProject(@Param('id') id: string) {
    return this.projectsService.finishProject(Number(id));
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    return this.projectsService.deleteProject(Number(id));
  }
  @Get('for-user')
  async getForUser(@Req() req) {
    const user = req.user;
    return this.projectsService.getProjectsForUser(user.userId, user.role);
  }
}
