import { getTokenFromCookie } from "@/utils/token";
import { BaseOperation } from "./base.service";



export class HistoryOperation extends BaseOperation {
    constructor() {
        super('http://localhost:5000/api/history');
    }

    async getHistoryData(id:string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('GET', `device/${id}`, undefined ,token);

    }
}