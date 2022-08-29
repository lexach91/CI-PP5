import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';


const VisitorNavbar = () => {
    const navigate = useNavigate();
    const navList = [
        { label: 'Home', icon: 'pi pi-home', command: () => navigate('/') },
        { label: 'Pricing', icon: 'pi pi-dollar', command: () => navigate('/pricing') },
        { label: 'Contact', icon: 'pi pi-phone', command: () => navigate('/contact') },
    ];


    const loginRegisterButtonGroup = (
        <React.Fragment>
            <div className="p-menuitem">
                <Button label="Login" icon="pi pi-user" className="p-button-info mr-2" onClick={() => {
                    navigate('/login')
                } } />
                <Button label="Register" icon="pi pi-user-plus" className="p-button-success" onClick={() => {
                    navigate('/register')
                } } />
            </div>
        </React.Fragment>
    )
    

    return (
        <header className="navbar">
            <nav>
                <Menubar model={navList} end={loginRegisterButtonGroup} />
            </nav>
        </header>
    );
}

export default VisitorNavbar;
