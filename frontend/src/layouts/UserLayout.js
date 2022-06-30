import React from 'react';
import { Helmet } from 'react-helmet';
import UserNavbar from '../components/navigation/UserNavbar';

export const UserLayout = ({ title, children }) => (
    <React.Fragment>
        <Helmet>
            <title>{title}</title>
        </Helmet>
        <UserNavbar />
        <main>{children}</main>
        {/* Footer */}
    </React.Fragment>
);

export default UserLayout;