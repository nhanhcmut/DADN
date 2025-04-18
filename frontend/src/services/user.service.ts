import { BaseOperation } from "./base.service";

export interface ResetPasswordDto {
    email: string;
    password: string;
    newPassword: string;

}

export class UserOperation extends BaseOperation {
    constructor() {
        super(`${process.env.NEXT_PUBLIC_API_URL}/api/users`);
    }

    async resetPassword(payload: ResetPasswordDto, token: string) {

        return this.request('POST', `reset-password`, payload, token);
    }

    async getInfo(token: string) {
        return this.request('GET', 'profile', undefined, token);
    }
}