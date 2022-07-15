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

export const getRoom = () => async (data) => {
    const response = await axios.get("rooms/get");
    console.log(response);
    return response.data;
}



export const checkInRoom = () => async () => {
    const response = await axios.get("rooms/check-user-in-room");
    return response.data;
};

export const createRoom = (data) => async () => {
    const response = await axios.post("rooms/create", data);
    return response.data;
};

export const joinRoom = (data) => async () => {
    const response = await axios.post("rooms/join", data);
    return response.data;
};

export const leaveRoom = (data) => async () => {
    const response = await axios.post("rooms/leave", data);
    return response.data;
};

export const deleteRoom = (data) => async () => {
    const response = await axios.post("rooms/delete", data);
    return response.data;
};

export const isRoomProtected = (data) => async () => {
    const response = await axios.post("rooms/is-protected", data);
    return response.data;
};

// export const getRoom = (data) => async () => {
//     const response = await axios.post("rooms/get", data);
//     return response.data;
// };


export default baseUrl;