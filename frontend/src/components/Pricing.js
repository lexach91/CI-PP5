import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { VisitorLayout } from "../layouts/VisitorLayout";
import { UserLayout } from "../layouts/UserLayout";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { Toast } from "primereact/toast";


const Pricing = () => {
    const { isAuthenticated, user, redirect, loading } = useSelector(
        (state) => state.auth
    );
    const dispatch = useDispatch();
    const toastRef = useRef();
    useEffect(() => {
        if (redirect) {
            dispatch(resetRedirect());
        }
    }, [redirect]);

    const LayoutComponent = isAuthenticated ? UserLayout : VisitorLayout;


    
    const redirectToRegister = () => {
        return <Navigate to="/register" />;
    };

    
    const redirectToCheckoutSession = async (sessionId) => {
        const response = await axios.post('checkout-session', {
            session_id: sessionId
        });
        const session_url = response.data.session.url;
        window.location.href = session_url;
    };

    const createCheckoutSession = async (planId) => {
        let payload = {
            plan_id: planId,
        };
        await axios.post("create-checkout-session", payload)
            .then((response) => {
                let sessionId = response.data.sessionId;
                redirectToCheckoutSession(sessionId);}
                )
            .catch((error) => {
            toastRef.current.show({
                severity: "error",
                detail: error.response.data.error,
            });
            console.log(error);
        });
    };

    const handleOnClick = (planId) => {
        if(isAuthenticated && user) {
            createCheckoutSession(planId);
        } else {
            toastRef.current.show({
                severity: "info",
                detail: "You need to be logged in to subscribe",
            });
            
        }
    };





    return loading ? (
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
            <RotateLoader
                sizeUnit={"px"}
                size={150}
                color={"#123abc"}
                loading={loading}
            />
        </div>
    ) : (
        <LayoutComponent title="Pricing">
            <Toast ref={toastRef} />
            <div className="surface-0">
                <div className="text-900 font-bold text-6xl mb-4 mt-4 text-center">Pricing Plans</div>
                <div className="text-700 text-xl mb-6 text-center line-height-3">
                    Choose the plan that best fits your needs.
                </div>

                <div className="grid grid-nogutter">
                    <div className="col-12 lg:col-4">
                        <div className="p-3 h-full">
                            <div className="shadow-2 p-3 h-full flex flex-column" style={{ borderRadius: '6px' }}>
                                <div className="text-900 font-medium text-xl mb-2">Basic</div>
                                <div className="text-600">Plan description</div>
                                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <div className="flex align-items-center">
                                    <span className="font-bold text-2xl text-900">$10</span>
                                    <span className="ml-2 font-medium text-600">per month</span>
                                </div>
                                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <ul className="list-none p-0 m-0 flex-grow-1">
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            Up to 4 people in a room
                                        </span>
                                    </li>
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            30-minute meeting duration
                                        </span>
                                    </li>                                    
                                </ul>
                                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300 mt-auto" />
                                <Button label="Buy Now" className="p-3 w-full mt-auto" onClick={() => handleOnClick(2)} />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 lg:col-4">
                        <div className="p-3 h-full">
                            <div className="shadow-2 p-3 h-full flex flex-column" style={{ borderRadius: '6px' }}>
                                <div className="text-900 font-medium text-xl mb-2">Premium</div>
                                <div className="text-600">Plan description</div>
                                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <div className="flex align-items-center">
                                    <span className="font-bold text-2xl text-900">$30</span>
                                    <span className="ml-2 font-medium text-600">per month</span>
                                </div>
                                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <ul className="list-none p-0 m-0 flex-grow-1">
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            Up to 9 people in a room
                                        </span>
                                    </li>
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            60-minute meeting duration
                                        </span>
                                    </li>
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            Screen sharing allowed
                                        </span>
                                    </li>                                    
                                </ul>
                                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <Button label="Buy Now" className="p-3 w-full" onClick={() => handleOnClick(3)} />
                            </div>
                        </div>
                    </div>

                    <div className="col-12 lg:col-4">
                        <div className="p-3 h-full">
                            <div className="shadow-2 p-3 flex flex-column" style={{ borderRadius: '6px' }}>
                                <div className="text-900 font-medium text-xl mb-2">Enterprise</div>
                                <div className="text-600">Plan description</div>
                                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <div className="flex align-items-center">
                                    <span className="font-bold text-2xl text-900">$60</span>
                                    <span className="ml-2 font-medium text-600">per month</span>
                                </div>
                                <hr className="my-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <ul className="list-none p-0 m-0 flex-grow-1">
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            Up to 12 people in a room
                                        </span>
                                    </li>
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            Unlimited meeting duration
                                        </span>
                                    </li>
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            Screen sharing allowed
                                        </span>
                                    </li>
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            Presentation sharing allowed
                                        </span>
                                    </li>
                                </ul>
                                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300" />
                                <Button label="Buy Now" className="p-3 w-full" onClick={() => handleOnClick(4)} />
                            </div>
                        </div>
                    </div>
                </div>
                {
                !isAuthenticated &&
                <div className="surface-0 text-700 text-center mt-8 mb-8 p-8">
                    <div className="text-900 font-bold text-5xl mb-3">
                    Want to be able just to join meetings?
                    </div>
                    <div className="text-700 text-2xl mb-5">
                    Open a free account now and you can join other people's meetings if you have a link.
                    </div>
                    <Button
                    label="Register"
                    icon="pi pi-user-plus"
                    className="font-bold px-5 py-3 p-button-raised p-button-rounded white-space-nowrap"
                    onClick={() => {
                        window.location.href = "/register";
                    }}
                    />
                </div>
                }

            </div>
        </LayoutComponent>
    );
}


    

export default Pricing;

