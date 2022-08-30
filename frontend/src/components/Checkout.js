import React, { useEffect, useState } from "react";
import RotateLoader from "react-spinners/RotateLoader";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet";
import { useDispatch, useSelector } from "react-redux";
import { setMessage, setError, getMembership } from "../redux/authSlice";

const Checkout = () => {
  const { loading, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false && loading === false) {
      dispatch(setError("You must be logged in to access this page."));
      setRestricted(true);
    }
  }, [isAuthenticated, loading]);

  if (restricted) {
    dispatch(setError("You must be logged in to access this page."));
    navigate("/");
  }

  useEffect(() => {
    const query = new URLSearchParams(window.location.search);

    if (query.get("success")) {
      dispatch(
        setMessage(
          "Thank you for your purchase! You will receive an email shortly with your receipt."
        )
      );
      dispatch(getMembership());
      navigate("/");
    }
    if (query.get("cancelled")) {
      dispatch(setError("Your purchase was cancelled."));
      navigate("/pricing");
    }
  }, []);

  return (
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
      <Helmet>
        <title>Checkout</title>
      </Helmet>
      <RotateLoader
        sizeUnit={"px"}
        size={150}
        color={"#123abc"}
        loading={true}
      />
    </div>
  );
};

export default Checkout;
