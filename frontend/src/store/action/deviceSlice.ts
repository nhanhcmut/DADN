
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {DeviceDto , DeviceOperation } from '@/services/device.service';
import { getTokenFromCookie } from '@/utils/token';



export const createDevice = createAsyncThunk<
{ success: boolean },
    DeviceDto,
    { rejectValue: RejectedValue }
>(
    'api/devices',
    async (payload, { rejectWithValue }) => {
        try { 
            
            const deviceOp = new DeviceOperation()
            const response = await deviceOp.createDevice(payload);
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



const createDeviceSlice = createSlice({
    name: 'createDevice',
    initialState: {
        loading: false,
        success: false,
        error: null,
    },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(createDevice.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.success = false;
            })
            .addCase(createDevice.fulfilled, (state) => {
                state.loading = false;
                state.success = true;
            })
            .addCase(createDevice.rejected, (state, action: PayloadAction<RejectedValue>) => {
                state.loading = false;
                state.error = action.payload;
                state.success = false;
            });
    },
});

export default createDeviceSlice.reducer;