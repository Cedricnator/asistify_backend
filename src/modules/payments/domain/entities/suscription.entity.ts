import { BlobOptions } from "buffer";

export class SuscriptionEntity {
  constructor(
    public readonly id: string,
    public readonly enterpriseId:string,
    public readonly membershipId:string,
    public readonly flowClientId:string,
    public readonly active:boolean=false,
    public readonly paid:boolean=false
  ) {}
}
