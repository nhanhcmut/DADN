
declare type ResetPasswordPayload = {
    email:string;
    password:string;
    newPassword:string;
};

declare type ResetPasswordState = {
    loading: boolean;
    success: boolean;
    error: RejectedValue | null;
};

declare type RejectedValue = string;