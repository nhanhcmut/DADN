import { getTokenFromCookie } from "@/utils/token";
import { BaseOperation } from "./base.service";

export interface DeviceDto{
    tempControlled: boolean;
    humidControlled: boolean;
    manualControl:boolean;
    pumpSpeed: number;
}

export class WaterProcessOperation extends BaseOperation {
    constructor() {
        super('http://localhost:5000/api/water-processes');
    }

    async updateWaterProcess(payload: DeviceDto ,id:string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('PATCH', `${id}/controls`, payload , token);
    }
    async getWaterProcess(id:string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('GET', `device/${id}`, undefined , token);
    }
}