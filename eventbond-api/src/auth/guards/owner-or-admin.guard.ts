import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';

@Injectable()
export class OwnerOrAdmin implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const user = req.user;
    const paramId = req.params && req.params.id !== undefined ? Number(req.params.id) : undefined;

    if (!user) {
      throw new ForbiddenException('No user found in request');
    }

    if (user.role === 'admin' || user.userId === paramId) {
      return true;
    }

    throw new ForbiddenException('Action is forbidden');
  }
}