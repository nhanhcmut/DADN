import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { getTokenFromCookie, removeTokenFromCookie, setTokenInCookie } from '@/utils/token';
import { AuthOperation, LoginDto } from '@/services/auth.service';
import { UserOperation } from '@/services/user.service';

const initialState: AuthState = {
    isAuthenticated: false,
    userInfo: null,
    error: null,
    loading: false,
};
export const login = createAsyncThunk<StaffInfo, LoginDto, { rejectValue: RejectedValue }>(
    '/login',
    async (payload, { rejectWithValue }) => {
      try {
        const authOp = new AuthOperation();
        const response = await authOp.login(payload);
        if (response.success) {
            const staffInfo = response.data as StaffInfo;
          setTokenInCookie(staffInfo.token); 
          return response.data as StaffInfo;
        } else {
          return rejectWithValue({ message: response.message || 'Login failed.' });
        }
      } catch (error: any) {
        // Handle any unexpected errors and reject the promise
        return rejectWithValue({
          message: error.message || 'Unexpected error occurred.',
        });
      }
    }
  );
  


export const fetchUserInfo = createAsyncThunk<StaffInfo, void, { rejectValue: RejectedValue }>(
    'auth/fetchUserInfo',
    async (_, { rejectWithValue }) => {
        const token = getTokenFromCookie();
        if (!token) {
            return rejectWithValue('No token found');
        }
        try {
            const userOp = new UserOperation();
            const response = await userOp.getInfo(token);
            if (response.success) {
                return response.data as StaffInfo;
            } else {
                return rejectWithValue(response.message);
            }
        } catch (error) {
            return rejectWithValue(error as RejectedValue);
        }
    }
);

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        logout: (state) => {
            state.isAuthenticated = false;
            state.userInfo = null;
            state.error = null;
            removeTokenFromCookie();
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(login.fulfilled, (state, action: PayloadAction<StaffInfo>) => {
                state.loading = false;
                state.isAuthenticated = true;
                state.userInfo = action.payload;
            })
            .addCase(login.rejected, (state, action: PayloadAction<RejectedValue>) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(fetchUserInfo.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchUserInfo.fulfilled, (state, action: PayloadAction<StaffInfo>) => {
                state.loading = false;
                state.userInfo = action.payload;
                state.isAuthenticated = true;
            })
            .addCase(fetchUserInfo.rejected, (state, action: PayloadAction<RejectedValue>) => {
                state.loading = false;
                state.isAuthenticated = false;
                state.error = action.payload;
            });
    },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;