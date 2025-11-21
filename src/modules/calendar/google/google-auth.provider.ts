import path from "node:path";
import process from 'node:process';
import {authenticate} from '@google-cloud/local-auth';
import {google} from 'googleapis';
import { OAuth2Client } from "googleapis-common";
import { oauth2 } from "googleapis/build/src/apis/oauth2";



class GoogleAuthProvider{
    CREDENTIALS_PATH: string;
    public auth: OAuth2Client;
    authenticated:boolean=false;
    private constructor() {
        this.CREDENTIALS_PATH = path.join(process.cwd(), 'gs2.json');
        
    }

    static async create(){
        const instance=new GoogleAuthProvider()
        await instance.authenticate()
        
        return instance;
    }

    async authenticate() {
        if (this.authenticated) {
            return this.auth;
        }
        this.authenticated = true;
        let access_token = process.env.GACCESS_TOKEN
        let refresh_token = process.env.GREFRESH_TOKEN
        if (access_token && refresh_token) {
            console.log("coso ", process.env.GCLIENT_ID, process.env.GCLIENT_SECRET)
            const oauth2Client = new google.auth.OAuth2(process.env.GCLIENT_ID, process.env.GCLIENT_SECRET);
            oauth2Client.setCredentials({ access_token, refresh_token });
            console.log(refresh_token, access_token)
            this.auth=oauth2Client;
            return oauth2Client;
        }


        const SCOPES = ['https://www.googleapis.com/auth/calendar'];
        this.auth = await authenticate({
            scopes: SCOPES,
            keyfilePath: this.CREDENTIALS_PATH,
        });
        const oauth2Client = new google.auth.OAuth2(
            this.auth._clientId,
            this.auth._clientSecret,
            "http://localhost:3000/goauth" // must match console setup
        );

        const url = oauth2Client.generateAuthUrl({
            access_type: "offline",  // IMPORTANT: gets you a refresh token
            prompt: "consent",       // ensures refresh_token is returned
            scope: [
                "https://www.googleapis.com/auth/calendar",

            ],
        });
        console.log(url)
        return this.auth;
    }
}

export const authProvider=GoogleAuthProvider.create();
