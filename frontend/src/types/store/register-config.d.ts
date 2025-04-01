declare type RegisterPayload = {
    username: string;
    email: string;
    password: string;
};

declare type RegisterState = {
    loading: boolean;
    success: boolean;
    error: RejectedValue | null;
};

declare type RejectedValue = string;