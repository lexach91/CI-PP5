import React, { useEffect, useState } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect, setError } from "../redux/authSlice";
import RotateLoader from "react-spinners/RotateLoader";
import { useParams } from "react-router-dom";
import { Navigate } from "react-router-dom";
import { Helmet } from "react-helmet";

const JoinRoom = () => {
  const { loading, redirect, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const { roomToken } = useParams();
  const [joined, setJoined] = useState();
  const [errorMessage, setErrorMessage] = useState();
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false && loading === false) {
      dispatch(setError("You must be logged in to access this page."));
      setRestricted(true);
    }
  }, [isAuthenticated, loading]);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
  }, [redirect]);

  if (restricted) {
    dispatch(setError("You must be logged in to access this page."));
    return <Navigate to="/" />;
  }

  const joinRoom = async () => {
    try {
      const query = new URLSearchParams(window.location.search);
      if (query.get("password")) {
        const response = await axios.post(`rooms/join`, {
          room_token: roomToken,
          password: query.get("password"),
        });
        setJoined(true);
        setErrorMessage(null);
        return response;
      } else {
        const response = await axios.post(`rooms/join`, {
          room_token: roomToken,
        });
        setJoined(true);
        setErrorMessage(null);
        return response;
      }
    } catch (error) {
      setErrorMessage("Error joining the room.");
      return error;
    }
  };

  if (joined) {
    return <Navigate to={`/room/${roomToken}`} replace={true} />;
  }

  if (!joined && !errorMessage) {
    joinRoom();
  }

  if (errorMessage) {
    dispatch(setError(errorMessage));
    return <Navigate to="/" />;
  }

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
        <title>Join Room</title>
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

export default JoinRoom;
