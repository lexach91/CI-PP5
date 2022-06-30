import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  isAuthenticated: false,
  user: null,
  error: null,
  loading: false,
  redirect: false,
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
      console.log(response);
      if (response.status === 201) {
        return response.data;
      } else {
        let errors = response.response.data;
        console.log(errors);
        // join all the errors into one string
        errors = Object.values(errors).join("<br>");
        console.log(errors);
        return thunkAPI.rejectWithValue(errors);
      }
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response.data);
    }
  }
);


export const getUser = createAsyncThunk(
    "auth/getUser",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("user");
            if (response.status === 200) {
                return response.data;
            } else {
                const {dispatch} = thunkAPI;
                dispatch(refreshToken());
                return thunkAPI.rejectWithValue(response.response.data.error);
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);


export const login = createAsyncThunk(
    "auth/login",
    async (data, thunkAPI) => {
        const { email, password } = data;
        try {
            const response = await axios.post("login", { email, password });
            if (response.status === 200) {
                console.log("Login success");
                const {dispatch} = thunkAPI;
                dispatch(getUser());
                return response.data;
            } else {
                console.log("Login failed");
                console.log(response);
                return thunkAPI.rejectWithValue(response.payload.error);
            }
        } catch (error) {
            console.log("Login failed");
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const logout = createAsyncThunk(
    "auth/logout",
    async (_, thunkAPI) => {
        try {
            const response = await axios.post("logout", {withCredentials: true});
            if (response.status === 200) {
                return response.data;
            } else {
                return thunkAPI.rejectWithValue(response.response.data.error);
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const checkAuth = createAsyncThunk(
    "auth/checkAuth",
    async (_, thunkAPI) => {
        try {
            const response = await axios.get("verify-token", {withCredentials: true});
            if (response.status === 200) {
                const {dispatch} = thunkAPI;
                dispatch(getUser());
                return response.data;
            } else {
                const {dispatch} = thunkAPI;
                dispatch(refreshToken());
                return thunkAPI.rejectWithValue(response.response.data.error);
            }
        } catch (error) {
            const {dispatch} = thunkAPI;
            dispatch(refreshToken());
            return thunkAPI.rejectWithValue(error.response.data);
        }
    }
);

export const refreshToken = createAsyncThunk(
    "auth/refreshToken",
    async (_, thunkAPI) => {
        try {
            const response = await axios.post("refresh", {withCredentials: true});
            if (response.status === 200) {
                const {dispatch} = thunkAPI;
                dispatch(checkAuth());
                return response.data;
            } else {
                const {dispatch} = thunkAPI;
                dispatch(logout());
                return thunkAPI.rejectWithValue(response.response.data.error);
            }
        } catch (error) {
            return thunkAPI.rejectWithValue(error.response.data);
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
            // state.redirect = true;
        })
        .addCase(login.rejected, (state, action) => {
            state.loading = false;
            console.log(action);
            console.log(action.payload);
            state.error = action.payload.error;
        })
        .addCase(getUser.pending, (state, action) => {
            state.loading = true;
        })
        .addCase(getUser.fulfilled, (state, action) => {
            state.loading = false;
            state.redirect = true;
            state.user = action.payload;
        })
        .addCase(getUser.rejected, (state, action) => {
            state.loading = false;
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
            // state.error = action.payload;
        })
  },
});



export const { resetRedirect, resetError } = authSlice.actions;

export default authSlice.reducer;

// export const { setAuth } = authSlice.actions;

// export default authSlice.reducer;
