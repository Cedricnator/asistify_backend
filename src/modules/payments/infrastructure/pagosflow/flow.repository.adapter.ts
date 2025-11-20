import { HmacSHA256 } from "crypto-js";
import { KVPair } from "../../domain/entities/kvpair.entity";

export class FlowRepositoryAdapter{
    private FLOW_URL = "https://sandbox.flow.cl/api"
      private signParamsString(params: KVPair[]): string {
        let secret = process.env.FLOW_SECRET!
        let message = ""
        for (let index = 0; index < params.length; index++) {
          const param = params[index];
          message += `${param.key}${param.value}`
        }
        console.log("result to mac ", message)
        var sign = HmacSHA256(message, secret).toString()
        return sign
      }

      private createURLParamObject(params:KVPair[],s:string){
        let urlParamsObject={}
        for (let index = 0; index < params.length; index++) {
            const param = params[index];
            urlParamsObject[param.key]=param.value;
        }
        urlParamsObject["s"]=s
        return urlParamsObject
      }

      public async post(endpoint:string,params:KVPair[]):Promise<Response>{
        let s = this.signParamsString(params);
        let paramsObject=this.createURLParamObject(params,s);
        const urlParams = new URLSearchParams(paramsObject)

        const res = await fetch(`${this.FLOW_URL}${endpoint}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: urlParams.toString(),
        })
        return res;
      }

    public async get(endpoint: string, params: KVPair[]): Promise<Response> {

        let s = this.signParamsString(params);
        let baseUrl = `${this.FLOW_URL}${endpoint}`

        let paramsObject=this.createURLParamObject(params,s);
        let urlParams = new URLSearchParams(paramsObject).toString();
        const fullUrl = `${baseUrl}?${urlParams}`;
        const res = await fetch(fullUrl, {
            method: "GET",
            headers: {
                "Accept": "application/json",
            },
        });
        return res
    }
}