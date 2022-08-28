import React, { useEffect, useState } from "react";
// import { Navigate } from "react-router-dom";
import RotateLoader from "react-spinners/RotateLoader";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";


const Checkout = () => {
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [sessionId, setSessionId] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        
        if (query.get('success')) {
            setSuccess(true);
            setSessionId(query.get('session_id'));
            setMessage("Thank you for your purchase! You will receive an email shortly with your receipt.");
            setTimeout(() => {
                // window.location.href = "/";
                navigate("/", { replace: true });
            }, 3000);
        }
        if (query.get('cancelled')) {
            setCancelled(true);
            setMessage("Your purchase was cancelled.");
            setTimeout(() => {
                // window.location.href = "/";
                navigate("/", { replace: true });
            }, 3000);
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