import axios from "axios";


const baseUrl = window.location.origin;

axios.defaults.baseURL = baseUrl + "/api";
axios.defaults.withCredentials = true;


// if response is 401 try to refresh token
let refreshing = false;
axios.interceptors.response.use(
    response => {
        return response;
    }, error => {
        if (error.response.status === 401) {
            if (refreshing) {
                return Promise.reject(error);
            }
            refreshing = true;
            return axios.post("refresh", {withCredentials: true})
                .then(response => {
                    refreshing = false;
                    return axios(error.config);
                })
                .catch(error => {
                    refreshing = false;
                    return Promise.reject(error);
                });
        } else {
            return Promise.reject(error);
        }
    }
);



export default baseUrl;