import { BaseOperation } from "./base.service";

export interface LoginDto {
    email: string;
    password: string;
}

export interface RegisterDto {
    username: string;
    email:string;
    password: string;
}

export interface ForgotPasswordDto {
    email:string;
}


export class AuthOperation extends BaseOperation {
    constructor() {
        super(`${process.env.NEXT_PUBLIC_API_URL}/api`);
    }

    async login(payload: LoginDto) {
        return this.request('POST', 'login', payload);
    }

    async register(payload: RegisterDto) {
        return this.request('POST', 'register',payload);
    }

    async forgotPassword(payload: ForgotPasswordDto) {
        return this.request('POST', 'forgot-password', payload);
    }

}