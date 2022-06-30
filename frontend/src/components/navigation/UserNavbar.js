import React, { useEffect, useRef, useState } from "react";
import { Menubar } from "primereact/menubar";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout } from "../../redux/authSlice";
import { Toast } from "primereact/toast";


const UserNavbar = () => {
    const { isAuthenticated, user, error, loading, redirect } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const [sidebarVisible, setSidebarVisible] = useState(false);
    const toast = useRef(null);

    useEffect(() => {
        if (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error,
                life: 7000
            });
            dispatch(logout());
        }
    }, [error]);

    

    const logoutButton = (
        <React.Fragment>
            <div className="p-menuitem">
                <Button label="Logout" icon="pi pi-power-off" className="p-button-danger" onClick={async () => {
                    dispatch(logout());
                } } />
            </div>
        </React.Fragment>
    );

    const userAvatar = () => {
        if (user) {
            if (user.avatar) {
                return <Chip image={user.avatar} label={user.first_name + " " + user.last_name} />;
            } else {
                return <Chip label={user.first_name + " " + user.last_name} icon="pi pi-user" />;
            }
        }
    };

    const userButton = (
        <React.Fragment>
            <div className="p-menuitem" onClick={
                () => {
                    setSidebarVisible(true);
                }
            }>
                {userAvatar()}
            </div>
        </React.Fragment>
    );

    return (
        <header className="navbar">
            <Toast ref={toast} />
            <nav className="navbar-nav">
                <Menubar start={userButton} end={logoutButton} />
            </nav>
            <Sidebar visible={sidebarVisible} onHide={() => setSidebarVisible(false)} />
        </header>
    );
}

export default UserNavbar;