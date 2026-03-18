import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TaskProgress {
  step: number;
  maxSteps: number;
  contentLoss: number;
  styleLoss: number;
  status: string;
  previewUrl?: string;
}

interface StyleTransferState {
  currentTask: TaskProgress | null;
  isProcessing: boolean;
  error: string | null;
}

const styleTransferSlice = createSlice({
  name: 'styleTransfer',
  initialState: {
    currentTask: null,
    isProcessing: false,
    error: null,
  } as StyleTransferState,
  reducers: {
    setTaskProgress(state: StyleTransferState, action: PayloadAction<TaskProgress>) {
      state.currentTask = action.payload;
      state.isProcessing = action.payload.status === 'processing';
    },
    setProcessing(state: StyleTransferState, action: PayloadAction<boolean>) {
      state.isProcessing = action.payload;
    },
    setError(state: StyleTransferState, action: PayloadAction<string | null>) {
      state.error = action.payload;
      state.isProcessing = false;
    },
  },
});

export const { setTaskProgress, setProcessing, setError } = styleTransferSlice.actions;

export const store = configureStore({
  reducer: {
    styleTransfer: styleTransferSlice.reducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
