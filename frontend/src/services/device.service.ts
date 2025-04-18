import { getTokenFromCookie } from "@/utils/token";
import { BaseOperation } from "./base.service";

export interface DeviceDto {
    name: string;
    location: string;
    usernameaio:string;
    keyaio: string;
}


export class DeviceOperation extends BaseOperation {
    constructor() {
        super(`${process.env.NEXT_PUBLIC_API_URL}/api`);
    }

    async createDevice(payload: DeviceDto) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('POST', `devices`, payload , token);
    }
    async getDevice() {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('GET', `devices`, undefined , token);
    }
    async getDeviceById(id :string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('GET', `devices/${id}`, undefined , token);
    }


}