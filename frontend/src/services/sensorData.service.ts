import { getTokenFromCookie } from "@/utils/token";
import { BaseOperation } from "./base.service";

export interface DeviceDto {

    name: string;
    location: string;
    usernameaio:string;
    keyaio: string;
}


export class SensorDataOperation extends BaseOperation {
    constructor() {
        super('http://localhost:5000/api/sensor-data');
    }

    async getSensorData(id:string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('GET', `device/${id}`, undefined , token);
    }
}