import { UserOperation , ResetPasswordDto } from '@/services/user.service';
import { getTokenFromCookie } from '@/utils/token';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

export const resetPassword = createAsyncThunk<
    { success: boolean },
    ResetPasswordDto,
    { rejectValue: RejectedValue }
>(
    'auth/resetPassword',
    async (payload, { rejectWithValue }) => {
        try {
            const UserOp = new UserOperation();
            const token =getTokenFromCookie();
            if (!token) return rejectWithValue("");
            const response = await UserOp.resetPassword(payload , token);
            if (response && response.success) {
                // Nếu API trả về thành công, trả về success
                return { success: true };
            } else {
                // Nếu API trả về lỗi, trả về message lỗi
                return rejectWithValue(response?.message || "Failed to reset password");
            } 
        } catch (error) {
            return rejectWithValue("Network error occurred");
        }
    }
);

// Slice for resetPassword
const resetPasswordSlice = createSlice({
    name: 'resetPassword',
    initialState: {
        loading: false,
        success: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(resetPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(resetPassword.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(resetPassword.rejected, (state, action: PayloadAction<RejectedValue>) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export default resetPasswordSlice.reducer;
