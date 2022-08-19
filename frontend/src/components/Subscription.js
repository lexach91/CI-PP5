import React, { useEffect, useState, useRef } from "react";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";

const Subscription = () => {
  const { isAuthenticated, user, redirect, loading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [subscription, setSubscription] = useState({});
  const [loadingSubscription, setLoadingSubscription] = useState(false);
  const toast = useRef(null);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      setLoadingSubscription(true);
      axios
        .get("membership-stripe")
        .then((res) => {
          console.log(res);
          setSubscription(res.data);
          setLoadingSubscription(false);
        })
        .catch((err) => {
          console.log(err);
          toast.current.show({
            severity: "error",
            detail: err.response.data.error,
          });
          setLoadingSubscription(false);
        });
    }
  }, [redirect, dispatch]);

  return loading || loadingSubscription ? (
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
        <Toast ref={toast} />
      <RotateLoader
        sizeUnit={"px"}
        size={150}
        color={"#123abc"}
        loading={loading}
      />
    </div>
  ) : isAuthenticated && user ? (
    <UserLayout title="Subscription">
        {subscription.id}
        <Toast ref={toast} />

    </UserLayout>
  ) : (<>
        <Toast ref={toast} />
  
  </>)
};

export default Subscription;
