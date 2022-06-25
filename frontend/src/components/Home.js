import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice";


const Home = () => {
    const [message, setMessage] = React.useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        (async () => {
            try {
                const {data} = await axios.get("user");

                console.log(data);
    
    
                setMessage(`Welcome ${data.firstName} ${data.lastName}`);
                dispatch(setAuth(true));
            } catch (error) {
                setMessage("You are not logged in");
                dispatch(setAuth(false));
            }
        })();
    }, []);
    
    return (
        <div>
        <h1>{message}</h1>
        </div>
    );
};

export default Home;