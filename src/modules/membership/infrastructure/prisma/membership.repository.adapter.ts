import { PrismaService } from '../../../prisma/prisma.service';
import { MembershipRepository } from '../../domain/repositories/membership.repository';
import { MembershipEntity } from '../../domain/entities/membership.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class MembershipRepositoryAdapter implements MembershipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createMembership(
    name: string,
    description: string,
    price: number,
    functionalities: string[],
  ): Promise<MembershipEntity> {
    const functionalitiesData = await Promise.all(
      functionalities.map(async (funcName) => {
        const func = await this.prisma.functionality.upsert({
          where: { name: funcName },
          update: {},
          create: { name: funcName },
        });
        return { functionality: { connect: { id: func.id } } };
      }),
    );

    const created = await this.prisma.membership.create({
      data: {
        name,
        description,
        price,
        functionalities: { create: functionalitiesData },
      },
      include: { functionalities: { include: { functionality: true } } },
    });

    // 🔁 Map Prisma → Entidad de dominio
    return new MembershipEntity(
      created.id,
      created.name,
      created.description,
      created.price,
      created.functionalities.map((f) => f.functionality.name),
    );
  }

  deleteMembership(id: string): Promise<MembershipEntity> {
    return this.prisma.membership.delete({
      where: {
        id: id,
      },
    });
  }

  async listMemberships(): Promise<MembershipEntity[]> {
    const memberships = await this.prisma.membership.findMany({
      include: {
        functionalities: {
          include: {
            functionality: true, // incluye la entidad Functionality relacionada
          },
        },
      },
    });
    // Adaptar los datos de Prisma a tus entidades de dominio
    return memberships.map(
      (m) =>
        new MembershipEntity(
          m.id,
          m.name,
          m.description,
          m.price,
          m.functionalities.map((mf) => mf.functionality.name),
        ),
    );
  }

  updateMembership(
    id: string,
    updates: Partial<{ membership: MembershipEntity }>,
  ): Promise<MembershipEntity> {
    return Promise.resolve(undefined);
  }
}
