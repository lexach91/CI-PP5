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
        if(error.response.status === 500) {
            window.location.href = "/500";
            return;
        }
        if (error.response.status === 401) {
            if (refreshing) {
                // return Promise.reject(error);
                return;
            }
            refreshing = true;
            return axios.post("refresh", {withCredentials: true})
                .then(response => {
                    refreshing = false;
                    return axios(error.config);
                })
                .catch(error => {
                    refreshing = false;
                    console.clear();
                    // console.log(error);
                    return Promise.reject("error");
                    // return;
                });
        } else {
            console.clear();
            return Promise.reject("error");
            // return;
        }
    }
);



export default baseUrl;