import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
// import UserLayout from "../layouts/UserLayout";
import RotateLoader from "react-spinners/RotateLoader";
import baseUrl from "../api/axios";
import { useParams } from "react-router-dom";

const Room = () => {
  const { loading, redirect, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const { roomToken } = useParams();
  const [room, setRoom] = useState({});
  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${wsProtocol}://${window.location.host}/ws/videorooms/${roomToken}/`;
  const webSocket = useRef();

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      const response = axios.get('api/rooms/get', {
        params: {
          room_token: roomToken,
        },
      });
      setRoom(response.data);
      }
  }, [roomToken]);

  useEffect(() => {
    if (isAuthenticated && user) {
      // open websocket connection sending cookies to the server
      webSocket.current = new WebSocket(wsUrl);
      webSocket.current.onopen = () => {
        console.log("Connected to WebSocket");
      }
      webSocket.current.onmessage = (event) => {
        console.log(event.data);
      }
      webSocket.current.onclose = () => {
        console.log("Disconnected from WebSocket");
      }
    }
  }, [room, isAuthenticated, user]);

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
    <div>
      <h1>{room.id}</h1>
    </div>
  ) : (
    <div>
      <h1>You are not logged in</h1>
    </div>
  );

};

export default Room;
