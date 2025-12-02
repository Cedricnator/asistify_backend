import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { jwtVerify } from 'jose';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { request } from 'express';

export interface SupabaseJwtPayload {
  sub: string;
  email?: string;
  role?: string;
  app_metadata: {
    enterprise_id?: string | null;
    profile_id?: string;
    role_id?: string;
    [key: string]: any;
  };
  user_metadata?: {
    [key: string]: any;
  };
  [key: string]: any;
}

declare module 'express' {
  interface Request {
    user?: SupabaseJwtPayload;
  }
}

@Injectable()
export class SupabaseAuthGuard implements CanActivate {
  private readonly logger = new Logger(SupabaseAuthGuard.name);

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
    const token: string | null = req.headers['authorization']?.split(' ')[1];
    if (!token) throw new UnauthorizedException('Missing bearer token');

    const developerToken = process.env.DEVELOPER_TOKEN || 'dev-token-123';

    if (developerToken && token === developerToken) {
      this.logger.warn('Acceso concedido mediante DEVELOPER TOKEN');
      // Mock a developer user for role-based access
      const devUser: SupabaseJwtPayload = {
        sub: 'developer-uuid',
        email: 'dev@aprendia.com',
        role: 'authenticated',
        app_metadata: {
          enterprise_id: 'dev-enterprise-id',
          profile_id: 'dev-profile-id',
          role_id: 'dev-role-admin',
        },
      };
      request.user = devUser;
      return true;
    }

    try {
      const authJwtSecret =
        this.configService.get<string>('supabase.authJwtSecret') ||
        process.env.SUPABASE_AUTH_JWT_SECRET;

      if (!authJwtSecret) {
        this.logger.error(`Error de configuracion del servidor`);
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
      const userPayload = payload as SupabaseJwtPayload;

      const enterpriseId = userPayload.app_metadata?.enterprise_id;

      if (!enterpriseId) {
        this.logger.warn(
          `Usuario ${payload.sub} intento acceder sin empresa vinculada`,
        );
        throw new ForbiddenException(
          'El usuario no pertenece a ninguna empresa. Complete su registro.',
        );
      }

      // attach user info for later
      request.user = userPayload; // contains sub, email, role, etc.
      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) throw error;

      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      this.logger.error(`Error de autenticación: ${error.message}`);
      throw new UnauthorizedException('Sesión inválida o expirada');
    }
  }
}
