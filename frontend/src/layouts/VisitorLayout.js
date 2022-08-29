import React from "react";
import { Helmet } from "react-helmet";
import VisitorNavbar from "../components/navigation/VisitorNavbar";
import { Divider } from "primereact/divider";
import { Link } from "react-router-dom";
import NewsletterButton from "../components/NewsletterButton";

const footer = () => {
  return (
    <React.Fragment>
      <div className="flex justify-content-around align-items-center surface-50 p-5 md:flex-row flex-column">
        <div className="footer-left">
          <div className="footer-logo">
            <i className="pi pi-chevron-left text-base text-blue-100"></i>
            <span className="text-xl text-gray-500">Dr</span>
            <span className="text-xl text-indigo-200">.</span>
            <span className="text-xl text-green-600">Meetings</span>
            <i className="pi pi-chevron-right text-base text-blue-100"></i>
          </div>
          <div className="footer-contact mt-5">
            <p>
              <i className="text-blue-500 pi pi-send"></i>
              <a
                href="mailto:dr.meetings@hotmail.com"
                className="text-gray-500 no-underline"
                aria-label="Email to dr.meetings@hotmail.com">
                dr@meetings.com
              </a>
            </p>
            <p>
              <i className="text-blue-500 pi pi-phone"></i>
              <a
                href="tel:+1-555-555-5555"
                className="text-gray-500 no-underline"
                aria-label="Call us">
                +1-555-555-5555
              </a>
            </p>
          </div>
        </div>
        <Divider layout="vertical" className="hidden md:block" />
        <Divider className="md:hidden" />

        <div className="footer-center text-center">
          <Link
            to="/contact"
            className="text-gray-500 no-underline block p-2 m-2"
            aria-label="Go to contact page">
            Contact
          </Link>
          <Link
            to="/terms-of-use"
            className="text-gray-500 no-underline block p-2 m-2"
            aria-label="Go to terms of use page">
            Terms of use
          </Link>
          <Link
            to="/privacy"
            className="text-gray-500 no-underline block p-2 m-2"
            aria-label="Go to privacy page">
            Privacy
          </Link>
          <NewsletterButton />
        </div>
        <Divider layout="vertical" className="hidden md:block" />
        <Divider className="md:hidden" />
        <div className="footer-right">
          <a
            href="https://www.facebook.com/"
            className="no-underline p-2 m-2"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Go to Facebook page, opens in new tab">
            <i className="text-blue-300 sm:text-4xl text-2xl pi pi-facebook"></i>
          </a>
          <a
            href="https://www.twitter.com/"
            className="no-underline p-2 m-2"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Go to Twitter page, opens in new tab">
            <i className="text-blue-300 sm:text-4xl text-2xl pi pi-twitter"></i>
          </a>
          <a
            href="https://www.instagram.com/"
            className="no-underline p-2 m-2"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Go to Instagram page, opens in new tab">
            <i className="text-blue-300 sm:text-4xl text-2xl pi pi-instagram"></i>
          </a>
          <a
            href="https://www.linkedin.com/"
            className="no-underline p-2 m-2"
            rel="noopener noreferrer"
            target="_blank"
            aria-label="Go to LinkedIn page, opens in new tab">
            <i className="text-blue-300 sm:text-4xl text-2xl pi pi-linkedin"></i>
          </a>
        </div>
      </div>
    </React.Fragment>
  );
};

export const VisitorLayout = ({ title, children }) => (
  <React.Fragment>
    <Helmet>
      <title>Dr.Meetings | {title}</title>
    </Helmet>
    <VisitorNavbar />
    <main>{children}</main>
    {footer()}
  </React.Fragment>
);

export default VisitorLayout;
