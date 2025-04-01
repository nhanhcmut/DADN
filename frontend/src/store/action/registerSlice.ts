import { AuthOperation } from '@/services/auth.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {RegisterDto } from '@/services/auth.service';

const initialState: RegisterState = {
    loading: false,
    success: false,
    error: null,
};

// Async thunk for user registration
export const register = createAsyncThunk<
{ success: boolean },
    RegisterDto,
    { rejectValue: RejectedValue }
>(
    'http://localhost:5000/api/register',
    async (payload, { rejectWithValue }) => {
        try {  
            const authOp = new AuthOperation();
            const response = await authOp.register(payload);
            if (response && response.success) {
                // Nếu API trả về thành công, trả về success
                return { success: true };
            } else {
                // Nếu API trả về lỗi, trả về message lỗi
                return rejectWithValue(response?.message || "Failed to reset password");
            }
        } catch (error) {
            return rejectWithValue(error as RejectedValue);
        }
    }
);

const registerSlice = createSlice({
    name: 'register',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(register.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(register.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(register.rejected, (state, action: PayloadAction<RejectedValue>) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export default registerSlice.reducer;