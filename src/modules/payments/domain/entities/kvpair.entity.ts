export class KVPair{
    constructor(public key:string, public value:string){

    }

    public static ApiKey():KVPair{
        return new KVPair("apiKey",process.env.FLOW_API_KEY!)
    }
}