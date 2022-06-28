import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setAuth } from "../redux/authSlice";
import { useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";


const Home = () => {
    // const auth = useSelector(state => state.auth.isAuthenticated);
    // const user = useSelector(state => state.auth.user);
    const { isAuthenticated, user } = useSelector(state => state.auth);
    const [message, setMessage] = React.useState("");
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(resetRedirect());
        
        if (isAuthenticated) {
            setMessage(`Welcome ${user.first_name} ${user.last_name}`);
        } else {
            setMessage("You are not logged in");
        }
    }, [isAuthenticated, user]);


    // useEffect(() => {
    //     (async () => {
    //         try {
    //             const {data} = await axios.get("user");
    
    
    //             setMessage(`Welcome ${data.first_name} ${data.last_name}`);
    //             dispatch(setAuth(true));
    //         } catch (error) {
    //             setMessage("You are not logged in");
    //             dispatch(setAuth(false));
    //         }
    //     })();
    // }, []);
    
    return (
        <div>
        <h1>{message}</h1>
        </div>
    );
};

export default Home;