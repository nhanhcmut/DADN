declare type AuthState = {
    isAuthenticated: boolean;
    userInfo: StaffInfo | null;
    error: string | SerializedError | null;
    loading: boolean;
}


declare type StaffInfo = {

    email: string;
    id: string;
    updatedAt: string;
    username: string;
 
};

declare type RejectedValue = string | SerializedError;