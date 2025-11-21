import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { jwtVerify } from 'jose';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private configService: ConfigService,
  ) {}

  async canActivate(ctx: ExecutionContext) {
    // Short-circuit if @Public() was set on the route *or* its controller
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (isPublic) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const developerToken = process.env.DEVELOPER_TOKEN || 'dev-token-123';

    if (developerToken && token === developerToken) {
      // Mock a developer user for role-based access
      const devUser = {
        sub: 'developer',
        email: 'developer@aprendia.com',
        role: 'admin', // Grant admin role to developer
        aud: 'authenticated',
        iss: 'developer',
      };
      (req as any).user = devUser;
      return true;
    }

    try {
      const authJwtSecret =
        this.configService.get<string>('supabase.authJwtSecret') ||
        process.env.SUPABASE_AUTH_JWT_SECRET;

      if (!authJwtSecret) {
        throw new UnauthorizedException(
          'SUPABASE_AUTH_JWT_SECRET is not configured',
        );
      }

      const { payload } = await jwtVerify(
        token,
        new TextEncoder().encode(authJwtSecret),
        {
          algorithms: ['HS256'],
        },
      );

      // attach user info for later
      (req as any).user = payload; // contains sub, email, role, etc.
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
