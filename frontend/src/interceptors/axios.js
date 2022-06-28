import axios from "axios";
// import {setToken} from "../redux/authSlice";




axios.defaults.baseURL = "http://127.0.0.1:8080/api/";
axios.defaults.withCredentials = true;




let refreshing = false;

axios.interceptors.response.use(resp => resp, async error => {
    if (error.response.status === 401 && !refreshing) {
        refreshing = true;
        const response = await axios.post("refresh", {});

        if (response.status === 200) {
            return axios(error.config);
        } 
    }
    refreshing = false;
    return error;
});