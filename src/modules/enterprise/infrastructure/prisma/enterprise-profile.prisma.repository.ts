import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { EnterpriseProfileRepository } from '../../domain/repositories/enterprise-profile.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { EnterpriseProfileEntity } from '../../domain/entities/enterprise-profile.entity';
import { EnterpriseProfileMapper } from '../mappers/enterprise-profile.mapper';
import { CreateEnterpriseProfileCommand } from '../../domain/commands/create-enterprise-profile.command';
import { DeleteEnterpriseProfileCommand } from '../../domain/commands/delete-enterprise-profile.command';
import { Prisma } from '@prisma/client';

@Injectable()
export class EnterpriseProfilePrismaRepository
  implements EnterpriseProfileRepository
{
  private readonly logger = new Logger(EnterpriseProfilePrismaRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(
    params: CreateEnterpriseProfileCommand,
  ): Promise<EnterpriseProfileEntity> {
    try {
      const enterpriseProfile =
        await this.prismaService.enterpriseProfile.create({
          data: EnterpriseProfileMapper.toCreate(params),
        });

      this.logger.log(
        `Enterprise profile created: ${enterpriseProfile.profile_id}, ${enterpriseProfile.enterprise_id}`,
      );
      return EnterpriseProfileMapper.toDomain(enterpriseProfile);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          this.logger.error(
            `Profile already linked to enterprise: ${params.profileId} -> ${params.enterpriseId}`,
          );
          throw new ConflictException(
            'Profile is already linked to this enterprise',
          );
        }
        if (error.code === 'P2003') {
          this.logger.error(
            `Foreign key constraint failed: ${String(error.meta?.field_name) || 'Unknown field'}`,
          );
          throw new NotFoundException(
            'Profile or enterprise not found. Verify both IDs exist.',
          );
        }
      }
      this.logger.error(
        `Unexpected error creating enterprise profile: ${error}`,
      );
      throw new InternalServerErrorException('Database error');
    }
  }

  async findByProfileAndEnterprise(
    profileId: string,
    enterpriseId: string,
  ): Promise<EnterpriseProfileEntity | null> {
    this.logger.log(
      `Finding enterprise profile with profileId: ${profileId} and enterpriseId: ${enterpriseId}`,
    );
    const enterpriseProfile =
      await this.prismaService.enterpriseProfile.findUnique({
        where: {
          profile_id_enterprise_id: {
            profile_id: profileId,
            enterprise_id: enterpriseId,
          },
        },
      });

    if (!enterpriseProfile) return null;

    return EnterpriseProfileMapper.toDomain(enterpriseProfile);
  }

  async findByEnterprise(
    enterpriseId: string,
    page: number,
    limit: number,
  ): Promise<{ data: EnterpriseProfileEntity[]; total: number }> {
    this.logger.log(
      `Finding enterprise profiles for enterpriseId: ${enterpriseId}, page: ${page}, limit: ${limit}`,
    );
    const skip = (page - 1) * limit;

    const [enterpriseProfiles, total] = await Promise.all([
      this.prismaService.enterpriseProfile.findMany({
        where: { enterprise_id: enterpriseId },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      this.prismaService.enterpriseProfile.count({
        where: { enterprise_id: enterpriseId },
      }),
    ]);

    return {
      data: enterpriseProfiles.map((ep) =>
        EnterpriseProfileMapper.toDomain(ep),
      ),
      total,
    };
  }

  async findByProfile(profileId: string): Promise<EnterpriseProfileEntity[]> {
    this.logger.log(
      `Finding enterprise profiles with profileId: ${profileId}`,
    );
    const enterpriseProfiles =
      await this.prismaService.enterpriseProfile.findMany({
        where: { profile_id: profileId },
      });

    return enterpriseProfiles.map((ep) => EnterpriseProfileMapper.toDomain(ep));
  }

  async delete(params: DeleteEnterpriseProfileCommand): Promise<void> {
    try {
      await this.prismaService.enterpriseProfile.delete({
        where: {
          profile_id_enterprise_id: {
            profile_id: params.profileId,
            enterprise_id: params.enterpriseId,
          },
        },
      });
      this.logger.log(
        `Enterprise profile deleted: ${params.profileId} -> ${params.enterpriseId}`,
      );
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2025') {
          this.logger.error(
            `Enterprise profile not found: ${params.profileId} -> ${params.enterpriseId}`,
          );
          throw new NotFoundException('Enterprise profile not found');
        }
      }
      this.logger.error(
        `Unexpected error deleting enterprise profile: ${error}`,
      );
      throw new InternalServerErrorException('Database error');
    }
  }
}
