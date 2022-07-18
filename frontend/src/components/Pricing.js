import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { VisitorLayout } from "../layouts/VisitorLayout";
import { UserLayout } from "../layouts/UserLayout";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";


const Pricing = () => {
    const { isAuthenticated, user, redirect, loading } = useSelector(
        (state) => state.auth
    );
    const dispatch = useDispatch();
    // const [layoutComponent, setLayoutComponent] = useState(VisitorLayout);

    useEffect(() => {
        if (redirect) {
            dispatch(resetRedirect());
        }
    }, [redirect]);

    // useEffect(() => {
    //     if (isAuthenticated && user) {
    //         setLayoutComponent(UserLayout);
    //     } else {
    //         setLayoutComponent(VisitorLayout);
    //     }
    // }, [isAuthenticated, user]);


    // const layoutComponent = isAuthenticated ? UserLayout : VisitorLayout;

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
        <VisitorLayout title="Pricing">
            <div className="surface-0">
                <div className="text-900 font-bold text-6xl mb-4 text-center">Pricing Plans</div>
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
                                        <span>Up to 5 guests at a meeting</span>
                                    </li>
                                    <li className="flex align-items-center mb-3">
                                        <i className="pi pi-check-circle text-green-500 mr-2"></i>
                                        <span>
                                            30-minute meeting duration
                                        </span>
                                    </li>                                    
                                </ul>
                                <hr className="mb-3 mx-0 border-top-1 border-bottom-none border-300 mt-auto" />
                                <Button label="Buy Now" className="p-3 w-full mt-auto" />
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
                                            Up to 10 guests at a meeting
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
                                <Button label="Buy Now" className="p-3 w-full" />
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
                                            Up to 20 guests at a meeting
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
                                <Button label="Buy Now" className="p-3 w-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </VisitorLayout>
    );
}


    

export default Pricing;

