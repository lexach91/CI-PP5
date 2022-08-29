import React from "react";
import { useSelector } from "react-redux";
import VisitorLayout from "../layouts/VisitorLayout";
import UserLayout from "../layouts/UserLayout";
import { Button } from "primereact/button";
import { useNavigate } from "react-router-dom";


const Page404 = () => {
    const { isAuthenticated } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const Layout = isAuthenticated ? UserLayout : VisitorLayout;
    return (
        <Layout title="Page Not Found">

            <div className="surface-50 border-round text-700 text-center md:w-8 md:mx-auto my-2 md:my-5 p-5">
                <div className="text-blue-600 font-bold mb-3"><i className="pi pi-exclamation-triangle"></i>404 Error</div>
                <div className="text-900 font-bold text-5xl mb-3">Page not found!</div>
                <div className="text-700 text-2xl mb-5">
                    The page you are looking for does not exist. It might have been moved or deleted.
                </div>
                <Button label="Home page" icon="pi pi-home" className="font-bold px-5 py-3 p-button-raised p-button-rounded white-space-nowrap" 
                    onClick={() => {
                        navigate("/");
                    }}                    
                />
            </div>
    
        </Layout>

    )
};

export default Page404;