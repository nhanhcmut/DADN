import { getTokenFromCookie } from "@/utils/token";
import { BaseOperation } from "./base.service";

export interface ActivationConditionDto {
    conditions :{
    temperature: {
        start: number;
        stop: number;
    };
    humidity: {
        start: number;
        stop: number;
    };
};
}

export class ActivationConditionOperation extends BaseOperation {
    constructor() {
        super('http://localhost:5000/api/activation-conditions');
    }

    async updateActivationCondition(payload: ActivationConditionDto ,id:string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('PATCH', `${id}`, payload , token);
    }
    async getActivationCondition(id:string) {
        const token=getTokenFromCookie();
        if (!token) {
            throw new Error("Token is missing. Please log in.");
        }
        
        return this.request('GET', `device/${id}`, undefined , token);
    }
}