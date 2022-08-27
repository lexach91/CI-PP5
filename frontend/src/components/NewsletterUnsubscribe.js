import React, { useEffect, useState } from "react";
import RotateLoader from "react-spinners/RotateLoader";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setMessage, setError } from "../redux/authSlice";
import axios from "axios";


const UnsubscribeNewsletter = () => {
    const { email } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    // const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = async () => {
            try {
                const response = await axios.post(`newsletter/unsubscribe`, {
                    email,
                });
                dispatch(setMessage(`${email} has been unsubscribed from the newsletter.`));
                navigate("/");
                return response;
            } catch (error) {
                dispatch(setError(error.response.data.error));
                navigate("/");
                return error;
            }
        };
        if (email) {
        unsubscribe();
        } else {
            dispatch(setError("No email provided."));
            navigate("/");
        }
    }, [email]);
    return;
}

export default UnsubscribeNewsletter;