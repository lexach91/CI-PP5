import React, { useEffect, useRef } from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
import { useDispatch } from 'react-redux';
import axios from 'axios';
import { Navigate } from 'react-router-dom';
// import { setAuth, setUser, setToken } from '../redux/authSlice';
import { store } from '../../redux/store';
import { logout, resetError } from '../../redux/authSlice';
import { Toast } from 'primereact/toast';


const VisitorNavbar = () => {
    // const auth = useSelector(state => state.auth.isAuthenticated);
    // const user = useSelector(state => state.auth.user);
    // const token = useSelector(state => state.auth.token);
    const { isAuthenticated, error } = useSelector(state => state.auth);
    const dispatch = useDispatch();
    const navList = [
        { label: 'Home', icon: 'pi pi-home', url: '/' },
        { label: 'Pricing', icon: 'pi pi-info', url: '/pricing' },
        { label: 'Contact', icon: 'pi pi-phone', url: '/contact' },
    ]
    const toast = useRef(null);
    // const checkAuth = async () => {
    //     try {
    //         if (token){
    //             console.log("token is present");
    //             axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    //             console.log(axios.defaults.headers.common['Authorization']);
    //             console.log(axios.defaults.withCredentials);
    //         }
    //         const accessToken = await store.getState().auth.token;
    //         const response = await axios.get("user", {
    //             headers: {
    //                 Authorization: `Bearer ${accessToken}`
    //             }});
    //         if (response.data.id) {
    //             dispatch(setAuth(true));
    //             dispatch(setUser(response.data));
    //         }
    //     } catch (error) {
    //         dispatch(setAuth(false));
    //     }
    // };
    // useEffect(() => {
    //     checkAuth();
    // }, [token]);
    useEffect(() => {
        if (error) {
            toast.current.show({
                severity: 'error',
                summary: 'Error',
                detail: error,
                life: 7000
            });
            dispatch(resetError());
        }
    }, [error]);


    const loginRegisterButtonGroup = (
        <React.Fragment>
            <div className="p-menuitem">
                <Button label="Login" icon="pi pi-user" className="p-button-info mr-2" onClick={() => {
                    window.location.href = '/login'
                } } />
                <Button label="Register" icon="pi pi-user-plus" className="p-button-success" onClick={() => {
                    window.location.href = '/register'
                } } />
            </div>
        </React.Fragment>
    )
    const logoutButton = (
        <React.Fragment>
            <div className="p-menuitem">
                <Button label="Logout" icon="pi pi-power-off" className="p-button-danger" onClick={async () => {
                    dispatch(logout());
                } } />
            </div>
        </React.Fragment>
    )

    return (
        <header className="navbar">
            <Toast ref={toast} />
            <nav>
                <Menubar model={navList} end={isAuthenticated ? logoutButton : loginRegisterButtonGroup} />
            </nav>
        </header>
    );
}

export default VisitorNavbar;
