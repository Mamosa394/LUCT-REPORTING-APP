import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../config/api';

export const globalSearch = createAsyncThunk(
  'search/global',
  async ({ query, type }, { rejectWithValue }) => {
    try {
      const response = await api.get('/search', { params: { q: query, type } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const searchSlice = createSlice({
  name: 'search',
  initialState: {
    results: { courses: [], modules: [], users: [], reports: [] },
    query: '',
    loading: false,
    error: null,
  },
  reducers: {
    setQuery: (state, action) => { state.query = action.payload; },
    clearResults: (state) => {
      state.results = { courses: [], modules: [], users: [], reports: [] };
      state.query = '';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(globalSearch.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(globalSearch.fulfilled, (state, action) => {
        state.loading = false;
        state.results = action.payload.results;
      })
      .addCase(globalSearch.rejected, (state, action) => {
        state.loading = false; state.error = action.payload;
      });
  },
});

export const { setQuery, clearResults } = searchSlice.actions;
export const selectSearchResults = (state) => state.search.results;
export const selectSearchLoading = (state) => state.search.loading;
export const selectSearchQuery = (state) => state.search.query;
export default searchSlice.reducer;