import { getTokenFromCookie } from "@/utils/token";
import { BaseOperation } from "./base.service";



export class HistoryOperation extends BaseOperation {
    constructor() {
        super(`${process.env.NEXT_PUBLIC_API_URL}/api/history`);
    }

    async getHistoryData(id:string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('GET', `device/${id}`, undefined ,token);

    }
}