import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
import RotateLoader from "react-spinners/RotateLoader";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useDispatch } from "react-redux";
import { setMessage, setError } from "../redux/authSlice";


const Checkout = () => {
    // const [message, setMessage] = useState("");
    // const [success, setSuccess] = useState(false);
    // const [cancelled, setCancelled] = useState(false);
    // const [sessionId, setSessionId] = useState("");
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        
        if (query.get('success')) {
            // setSuccess(true);
            // setSessionId(query.get('session_id'));
            dispatch(setMessage("Thank you for your purchase! You will receive an email shortly with your receipt."));            
            navigate("/", { replace: true });            
        }
        if (query.get('cancelled')) {
            // setCancelled(true);
            dispatch(setError("Your purchase was cancelled."));            
            navigate("/", { replace: true });           
        }
    } , []);

    return (
        <div
            className="loader-container"
            style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "100vh",
                width: "100vw",
                backgroundColor: "#f5f5f5",
                position: "absolute",
                top: 0,
                left: 0,
                zIndex: "9999",
            }}>
            <Helmet>
                <title>Checkout</title>
            </Helmet>
            <RotateLoader
                sizeUnit={"px"}
                size={150}
                color={"#123abc"}
                loading={true}
            />
        </div>
    )
}

export default Checkout;