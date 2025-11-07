import {PrismaService} from "../../../prisma/prisma.service";
import {MembershipRepository} from "../../domain/repositories/membership.repository";
import {MembershipEntity} from "../../domain/entities/membership.entity";
import {Injectable} from "@nestjs/common";
@Injectable()
export class MembershipRepositoryAdapter implements MembershipRepository{
    constructor(private readonly prisma : PrismaService) {



    }

    createMembership(name: string, description: string, price: number, functionalities: string[]): Promise<MembershipEntity> {
        return Promise.resolve(undefined);
    }

    deleteMembership(id: string): Promise<MembershipEntity> {
        return this.prisma.membership.delete({where:{
            id:id
            }});
    }

    async listMemberships(): Promise<MembershipEntity[]> {
        return [new MembershipEntity("1", "plan básico","la base de tu negocio", 19990, ["hola","chao"]
        )]
        /*
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

         */
    }


    updateMembership(id: string, updates: Partial<{ membership: MembershipEntity }>): Promise<MembershipEntity> {
        return Promise.resolve(undefined);
    }

}