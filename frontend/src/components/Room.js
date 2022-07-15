import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
// import UserLayout from "../layouts/UserLayout";
import RotateLoader from "react-spinners/RotateLoader";
import baseUrl from "../api/axios";
import { useParams } from "react-router-dom";


const Room = () => {
    const {
        loading,
        redirect,
        isAuthenticated,
    } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { roomToken } = useParams();
    const [room, setRoom] = useState({});
    const [error, setError] = useState("");
    const messageRef = useRef();
    const hostVideoRef = useRef();
    const [guestsVideoRefs, setGuestsVideoRefs] = useState([]);
    const [guests, setGuests] = useState([]);
    const [guestsStreams, setGuestsStreams] = useState([]);

    useEffect(() => {
        if (redirect) {
            dispatch(resetRedirect());
        }        
    }, [redirect]);

    const getRoomData = async () => {
        let payload = {
            room_token: roomToken,
        };
        console.log(payload);
        console.log(roomToken);
        // django will need to get rhe room token from the request data
        // await axios.get
        let res = await axios.get('rooms/get', {
            params: payload,
        });
        console.log(res);
        setRoom(res.data);
        console.log(room);
    };

    const startStream = async () => {
        const constraints = {
            audio: true,
            video: {
                width: { ideal: 1280 },
                height: { ideal: 720 },
            },
        };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        hostVideoRef.current.srcObject = stream;
    };

    useEffect(() => {
        if(isAuthenticated && roomToken) {
            getRoomData();
        }
    }, [isAuthenticated, roomToken]);

    useEffect(() => {
        if(room) {
            startStream();
        }
    }, [room]);

    

    return loading || !isAuthenticated ? (
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
            <div className="room-container">
                <div className="videos-container">
                    <div className="host-video">
                        <video ref={hostVideoRef} autoPlay playsInline style={{
                            width: "400px",
                        }}/>
                    </div>
                    {/* {room.guests.map((guest) => (
                        <div className="guest-video" key={guest.id}>
                            <video autoPlay playsInline muted></video>
                        </div>
                    ))} */}
                </div>
            </div>
        );
}

export default Room;
        