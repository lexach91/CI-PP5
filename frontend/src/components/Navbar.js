import React from 'react';
import { Menubar } from 'primereact/menubar';
import { Button } from 'primereact/button';

const Navbar = () => {
    const navList = [
        { label: 'Home', icon: 'pi pi-home', url: '/' },
        { label: 'About', icon: 'pi pi-info', url: '/about' },
        { label: 'Contact', icon: 'pi pi-phone', url: '/contact' },
    ]
    return (
        <header className="navbar">
            <nav>
                <Menubar model={navList} end={<Button label="Register" className="p-button-warning" onClick={() => { window.location.href = '/register' }} />} />
            </nav>
        </header>
    );
}

export default Navbar;
