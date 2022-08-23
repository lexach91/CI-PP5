import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: null,
  user: null,
  error: null,
  message: null,
  loading: null,
  redirect: null,
  membership: null,
  membershipLoading: null,
};

export const register = createAsyncThunk(
  "auth/register",
  async (data, thunkAPI) => {
    const {
      first_name,
      last_name,
      email,
      password,
      password_confirm,
      country,
      birth_date,
    } = data;
    try {
      const response = await axios.post("register", {
        first_name,
        last_name,
        email,
        password,
        password_confirm,
        country,
        birth_date,
      });
        return response.data;        
    } catch (error) {
      let errorsData = error.response.data;
      let errors = [];
      // join all keys and values into one string
      for (let key in errorsData) {
        errors.push(`${key}: ${errorsData[key]}`);
      }
      return thunkAPI.rejectWithValue(errors);
    }
  }
);

export const getUser = createAsyncThunk("auth/getUser", async (_, thunkAPI) => {
  try {
    const response = await axios.get("user");
    const { dispatch } = thunkAPI;
    dispatch(getMembership());
    return response.data;    
  } catch (error) {
    const { dispatch } = thunkAPI;
    dispatch(refreshToken());
    return thunkAPI.rejectWithValue(error.response.data.error);
  }
});

export const login = createAsyncThunk("auth/login", async (data, thunkAPI) => {
  const { email, password } = data;
  try {
    const response = await axios.post("login", { email, password });
    console.log("Login success");
    const { dispatch } = thunkAPI;
    dispatch(getUser());
    return response.data;      
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.error);
  }
});

export const logout = createAsyncThunk("auth/logout", async (_, thunkAPI) => {
  try {
    const response = await axios.post("logout", { withCredentials: true });
    return response.data;
  } catch (error) {
    return thunkAPI.rejectWithValue(error.response.data.error);
  }
});

export const checkAuth = createAsyncThunk(
  "auth/checkAuth",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("verify-token", {
        withCredentials: true,
      });
      const { dispatch } = thunkAPI;
      dispatch(getUser());
      return response.data;
    } catch (error) {
      const { dispatch } = thunkAPI;
      dispatch(refreshToken());
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);

export const refreshToken = createAsyncThunk(
  "auth/refreshToken",
  async (_, thunkAPI) => {
    try {
      const response = await axios.post("refresh", { withCredentials: true });
        const { dispatch } = thunkAPI;
        dispatch(checkAuth());
        return response.data;
    } catch (error) {
        // const { dispatch } = thunkAPI;
        // dispatch(logout());
      return thunkAPI.rejectWithValue(error.response.data.error);
    }
  }
);

export const getMembership = createAsyncThunk(
  "auth/getMembership",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get("membership");
        return response.data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data.error);
    }
  }
);

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    resetRedirect: (state) => {
      state.redirect = false;
    },
    resetError: (state) => {
      state.error = null;
    },
    resetMessage: (state) => {
        state.message = null;
        },
    setError: (state, action) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(register.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.redirect = true;
        state.message = "Registration successful";
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(login.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
        state.message = "Login successful";
        // state.redirect = true;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(getUser.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.redirect = true;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(getUser.rejected, (state, action) => {
        state.loading = false;
        // state.isAuthenticated = false;
        state.error = action.payload;
      })
      .addCase(logout.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state, action) => {
        state.loading = false;
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        state.message = "Logout successful";
      })
      .addCase(logout.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(checkAuth.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(checkAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(checkAuth.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        // state.error = action.payload;
      })
      .addCase(refreshToken.pending, (state, action) => {
        state.loading = true;
      })
      .addCase(refreshToken.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
      })
      .addCase(refreshToken.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        // state.error = action.payload;
      })
      .addCase(getMembership.pending, (state, action) => {
        state.membershipLoading = true;
      })
      .addCase(getMembership.fulfilled, (state, action) => {
        state.membershipLoading = false;
        state.membership = action.payload;
      })
      .addCase(getMembership.rejected, (state, action) => {
        state.membershipLoading = false;
        state.error = action.payload;
      });
  },
});

export const { resetRedirect, resetError, resetMessage, setError } = authSlice.actions;

export default authSlice.reducer;

// export const { setAuth } = authSlice.actions;

// export default authSlice.reducer;
