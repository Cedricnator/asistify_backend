import { PaginatedResponseDto } from 'src/common/dtos/paginated-response.dto';
import { CreateAvatarCommand } from '../../domain/commands/create-avatar.command';
import { AvatarEntity } from '../../domain/entities/avatar.entity';
import { AvatarRepository } from '../../domain/repositories/avatar.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { AvatarMapper } from '../mappers/avater.mapper';
import { NotFoundError } from 'rxjs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AvatarPrismaRepository implements AvatarRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(params: CreateAvatarCommand): Promise<AvatarEntity> {
    const avatar = await this.prismaService.avatar.create({
      data: AvatarMapper.toCreate(params),
    });
    return AvatarMapper.toDomain(avatar);
  }

  async findOneById(id: string): Promise<AvatarEntity | null> {
    const avatar = await this.prismaService.avatar.findUnique({
      where: {
        id: id,
      },
    });
    if (!avatar) {
      throw new NotFoundError(`Avatar with id ${id} not found`);
    }
    return AvatarMapper.toDomain(avatar);
  }

  async findAll(params: {
    page?: number;
    limit?: number;
  }): Promise<PaginatedResponseDto<AvatarEntity>> {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const skip = (page - 1) * limit;

    const [avatar, total] = await Promise.all([
      this.prismaService.avatar.findMany({
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prismaService.avatar.count(),
    ]);

    return {
      data: AvatarMapper.toList(avatar),
      meta: {
        total: total,
        page: page,
        limit: limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async update(params: AvatarEntity): Promise<AvatarEntity> {
    const updated = await this.prismaService.avatar.update({
      where: {
        id: params.id,
      },
      data: AvatarMapper.toUpdate(params),
    });
    return AvatarMapper.toDomain(updated);
  }
}
