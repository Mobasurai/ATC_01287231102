import { CanActivate, ExecutionContext, Injectable, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class CreateAdmin implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    const { body } = req;

    if (body.role !== 'admin') {
      return true;
    }

    let token: string | undefined;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies['jwt']) {
      token = req.cookies['jwt'];
    }

    if (!token) {
      throw new ForbiddenException('Action is forbidden');
    }

    try {
      const payload = this.jwtService.verify(token, { secret: process.env.JWT_SECRET });
      if (!payload || payload.role !== 'admin') {
        throw new ForbiddenException('Action is forbidden');
      }
      req.user = payload;
      return true;
    } catch {
      throw new ForbiddenException('Action is forbidden');
    }
  }
}