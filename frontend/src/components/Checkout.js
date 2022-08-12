import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import RotateLoader from "react-spinners/RotateLoader";



const Checkout = () => {
    const [message, setMessage] = useState("");
    const [success, setSuccess] = useState(false);
    const [cancelled, setCancelled] = useState(false);
    const [sessionId, setSessionId] = useState("");

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        
        if (query.get('success')) {
            setSuccess(true);
            setSessionId(query.get('session_id'));
            setMessage("Thank you for your purchase! You will receive an email shortly with your receipt.");
            setTimeout(() => {
                window.location.href = "/";
            }, 3000);
        }
        if (query.get('cancelled')) {
            setCancelled(true);
            setMessage("Your purchase was cancelled.");
            setTimeout(() => {
                window.location.href = "/";
            }, 3000);
        }
    } , []);

    return (
        <div className="flex flex-column justify-content-center align-items-center" style={{height:"100%", paddingTop:"20rem"}}>
            <div className="card text-center" style={{width:"50%", height:"50%"}}>
                <div className="checkout-header">
                    <h1>Checkout</h1>
                </div>
                <div className="checkout-body">
                    {success ? (
                        <div className="checkout-success">
                            <h2>Successful!</h2>
                            <p>{message}</p>
                            <p>Session ID: {sessionId}</p>
                            <p>You will be redirected to the home page in 3 seconds.</p>
                        </div>
                    ) : cancelled ? (
                        <div className="checkout-cancelled">
                            <h2>Unsuccessful!</h2>
                            <p>{message}</p>
                            <p>You will be redirected to the home page in 3 seconds.</p>
                        </div>
                    ) : (
                        <div className="checkout-loading">
                            <h2>Loading...</h2>
                            <RotateLoader color={"#123abc"} loading={true} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Checkout;