import React from "react";
import { Helmet } from "react-helmet";
import VisitorNavbar from '../components/navigation/VisitorNavbar';

export const VisitorLayout = ({ title, children }) => (
    <React.Fragment>
        <Helmet>
            <title>{title}</title>
        </Helmet>
        <VisitorNavbar />
        <main>{children}</main>
        {/* Footer */}
    </React.Fragment>
);

export default VisitorLayout;