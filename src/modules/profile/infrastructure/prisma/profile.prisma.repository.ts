import { Injectable, Logger } from '@nestjs/common';
import { ProfileRepository } from '../../domain/repositories/profile.repository';
import { PrismaService } from 'src/modules/prisma/prisma.service';
import { ProfileEntity } from '../../domain/entities/profile.entity';
import { ProfileMapper } from '../mappers/profile.mapper';
import { CreateProfileWithUserIdCommand } from '../../domain/commands/create-profile-with-user-id.command';

@Injectable()
export class ProfilePrismaRepository implements ProfileRepository {
  private readonly logger = new Logger(ProfilePrismaRepository.name);

  constructor(private readonly prismaService: PrismaService) {}

  async create(params: CreateProfileWithUserIdCommand): Promise<ProfileEntity> {
    const profile = await this.prismaService.profile.create({
      data: ProfileMapper.toCreate(params),
    });

    return ProfileMapper.toDomain(profile);
  }

  async findByEmail(email: string): Promise<ProfileEntity | null> {
    const profile = await this.prismaService.profile.findUnique({
      where: { email: email },
    });

    if (!profile) return null;

    return ProfileMapper.toDomain(profile);
  }

  async findById(id: string): Promise<ProfileEntity | null> {
    const profile = await this.prismaService.profile.findUnique({
      where: { id: id },
    });

    if (!profile) return null;

    return ProfileMapper.toDomain(profile);
  }

  async update(params: ProfileEntity): Promise<ProfileEntity> {
    this.logger.log(`Updating profile: ${params.id}`);

    const profile = await this.prismaService.profile.update({
      where: { id: params.id },
      data: ProfileMapper.toUpdate(params),
    });

    return ProfileMapper.toDomain(profile);
  }
}
