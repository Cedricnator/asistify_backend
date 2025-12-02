import {
  createParamDecorator,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { SupabaseJwtPayload } from '../guards/supabase-auth.guard';

export const EnterpriseId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const request = ctx.switchToHttp().getRequest();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const user = request.user as SupabaseJwtPayload;

    if (!user?.app_metadata?.enterprise_id) {
      throw new ForbiddenException(
        'No se encontró el Enterprise ID en el token del usuario',
      );
    }

    return user.app_metadata.enterprise_id;
  },
);
