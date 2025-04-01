
declare type ForgotPasswordPayload = {
    email: string;
};

declare type ForgotPasswordState = {
    loading: boolean;
    success: boolean;
    error: RejectedValue | null;
};

declare type RejectedValue = string;