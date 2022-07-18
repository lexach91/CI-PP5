import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { VisitorLayout } from "../layouts/VisitorLayout";
import { UserLayout } from "../layouts/UserLayout";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";

const Home = () => {
  // const auth = useSelector(state => state.auth.isAuthenticated);
  // const user = useSelector(state => state.auth.user);
  const { isAuthenticated, user, redirect, loading } = useSelector(
    (state) => state.auth
  );
  const [message, setMessage] = React.useState("");
  const dispatch = useDispatch();

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      setMessage(`Welcome ${user.first_name} ${user.last_name}`);
    } else {
      setMessage("You are not logged in");
    }
  }, [isAuthenticated, user, redirect]);

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
  ) : isAuthenticated ? (
    <UserLayout title="Home">
      <h1>{message}</h1>
    </UserLayout>
  ) : (
    <VisitorLayout title="Home">
      <div className="grid grid-nogutter surface-50 text-800 h-30rem">
        <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
          <section>
            <span className="block text-6xl font-bold mb-1">
              Absolutely new level of
            </span>
            <div className="text-6xl text-primary font-bold mb-3">
              cloud meetings
            </div>
            <p className="mt-0 mb-4 text-700 line-height-3">
              Our platform is the best way to manage your meetings and video calls.
            </p>

            <Button
              label="Learn More"
              type="button"
              className="mr-3 p-button-raised"
              onClick={() => {
                // scroll to the next section
                const element = document.getElementById("features");
                element.scrollIntoView({ behavior: "smooth" });

              }}
            />
            <Button
              label="Get Started"
              type="button"
              className="p-button-outlined"
              onClick={() => {
                window.location.href = "/pricing";
              }}
            />
          </section>
        </div>
        <div className="col-12 md:col-6 overflow-hidden h-full">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="hero-1"
            className="md:ml-auto block md:h-full"
            style={{ clipPath: "polygon(8% 0, 100% 0%, 100% 100%, 0 100%)" }}
          />
        </div>
      </div>
      <Divider />
      <div className="surface-0 text-center mt-8 p-5">
        <div className="mb-3 font-bold text-2xl">
          <span className="text-900">One Product, </span>
          <span className="text-blue-600">Many Solutions</span>
        </div>
        <div className="text-700 text-sm mb-6">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
        </div>
        <div className="grid grid-nogutter">
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-desktop text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">
              Built for Everyone
            </div>
            <span className="text-700 text-sm line-height-3">
              It doesn't matter what you do, we have a solution for you.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-lock text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">
              End-to-End Encryption
            </div>
            <span className="text-700 text-sm line-height-3">
              We assume that our customers are secure.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-check-circle text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">Easy to Use</div>
            <span className="text-700 text-sm line-height-3">
              We have a simple and easy to use interface.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-globe text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">
              Fast & Global Support
            </div>
            <span className="text-700 text-sm line-height-3">
              Let's imagine that we are the real business and we are there for you 24/7.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-github text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">Open Source</div>
            <span className="text-700 text-sm line-height-3">
              You can see every single line of code that we use.
            </span>
          </div>
          <div className="col-12 md:col-4 md:mb-4 mb-0 px-3">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-shield text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">Trusted Security</div>
            <span className="text-700 text-sm line-height-3">
              We have a strong security team that is always ready to help you.
            </span>
          </div>
        </div>
      </div>
      <Divider />
      <div className="surface-0 text-700 text-center mt-8 mb-8 p-8">
        <div className="text-900 font-bold text-5xl mb-3">
          Ready to Get Started?
        </div>
        <div className="text-700 text-2xl mb-5">
          See our pricing and choose the best plan for you.
        </div>
        <Button
          label="See Pricing"
          icon="pi pi-arrow-right"
          className="font-bold px-5 py-3 p-button-raised p-button-rounded white-space-nowrap"
          onClick={() => {
            window.location.href = "/pricing";
          }}
        />
      </div>
    </VisitorLayout>
  );
};

export default Home;
