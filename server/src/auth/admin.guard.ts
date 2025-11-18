import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ForbiddenException,
} from '@nestjs/common';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    // console.log('ADMIN GUARD req.user:', req.user);

    if (!req.user) {
      console.log('AdminGuard FAIL: No req.user');
    }

    if (req.user?.role !== 'ADMIN') {
      console.log('AdminGuard FAIL: role =', req.user?.role);
      throw new ForbiddenException('Access denied: Admins only');
    }

    console.log('AdminGuard SUCCESS: role =', req.user.role);

    return true;
  }
}
