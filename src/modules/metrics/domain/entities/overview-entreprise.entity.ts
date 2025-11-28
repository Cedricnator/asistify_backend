export class OverviewEntrepriseEntity {
  constructor(
    private readonly countDocuments: number,
    private readonly countCalls: number,
    private readonly countReceptionist: number,
  ) {}
}
