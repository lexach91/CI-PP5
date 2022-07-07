import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { VisitorLayout } from "../layouts/VisitorLayout";
import { UserLayout } from "../layouts/UserLayout";


const Home = () => {
    // const auth = useSelector(state => state.auth.isAuthenticated);
    // const user = useSelector(state => state.auth.user);
    const { isAuthenticated, user, redirect, loading } = useSelector(state => state.auth);
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
      ) : (
        isAuthenticated ? <UserLayout title='Home'>
            <h1>{message}</h1>
        </UserLayout> : <VisitorLayout title='Home'>
            <h1>{message}</h1>
        </VisitorLayout>
      )
};

export default Home;