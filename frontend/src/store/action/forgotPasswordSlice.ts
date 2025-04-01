import { AuthOperation } from '@/services/auth.service';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

const initialState: ForgotPasswordState = {
    loading: false,
    success: false,
    error: null,
};

export const forgotPassword = createAsyncThunk<
    void,
    ForgotPasswordPayload,
    { rejectValue: RejectedValue }
>(
    'auth/forgotPassword',
    async (payload, { rejectWithValue }) => {
        try {
            const authOp = new AuthOperation();
            const response = await authOp.forgotPassword(payload);
        } catch (error) {
            return rejectWithValue(error as RejectedValue);
        }
    }
);

const forgotPasswordSlice = createSlice({
    name: 'forgotPassword',
    initialState,
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(forgotPassword.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(forgotPassword.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(forgotPassword.rejected, (state, action: PayloadAction<RejectedValue>) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export default forgotPasswordSlice.reducer;