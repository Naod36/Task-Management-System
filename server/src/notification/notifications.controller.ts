import {
  Controller,
  Get,
  Put,
  Param,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private notificationsService: NotificationsService) {}

  @Get()
  async getUserNotifications(@Req() req) {
    // 1. Debugging: Check what the request actually holds
    console.log('User from Request:', req.user);

    const userId = req.user.userId; // Check both common JWT fields

    // 2. Safety Check: If userId is missing, stop here!
    if (!userId) {
      console.error('No userId found in request context');
      throw new UnauthorizedException('User ID could not be determined');
    }

    // 3. Ensure userId is a Number (sometimes JWT returns strings)
    return this.notificationsService.getUserNotifications(Number(userId));
  }

  @Put(':id/read')
  async markAsRead(@Param('id') id: string) {
    return this.notificationsService.markAsRead(Number(id));
  }

  @Put('read-all')
  async markAllAsRead(@Req() req) {
    const userId = req.user.userId; // not the task's assignee
    return this.notificationsService.markAllAsRead(userId);
  }
}
