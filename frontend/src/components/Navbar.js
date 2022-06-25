import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useSelector } from 'react-redux';
const Navbar = () => {
    const auth = useSelector(state => state.auth);
    const navList = [
        { label: 'Home', icon: 'pi pi-home', url: '/' },
        { label: 'About', icon: 'pi pi-info', url: '/about' },
        { label: 'Contact', icon: 'pi pi-phone', url: '/contact' },
    ]
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
                <Button label="Logout" icon="pi pi-power-off" className="p-button-danger" onClick={() => {
                    window.location.href = '/logout'
                } } />
            </div>
        </React.Fragment>
    )

    return (
        <header className="navbar">
            <nav>
                <Menubar model={navList} end={auth ? logoutButton : loginRegisterButtonGroup} />
            </nav>
        </header>
    );
}

export default Navbar;
