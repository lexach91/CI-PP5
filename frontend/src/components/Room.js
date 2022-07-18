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
        user,
    } = useSelector((state) => state.auth);
    const dispatch = useDispatch();
    const { roomToken } = useParams();
    const [room, setRoom] = useState({});
    const [error, setError] = useState("");
    const messageRef = useRef();
    const hostVideoRef = useRef();
    const userVideoRef = useRef();
    const userStreamRef = useRef();
    const socketRef = useRef();
    const peerRef = useRef();
    const [guestsRefs, setGuestsRefs] = useState([]);
    const [isHost, setIsHost] = useState(false);
    // const [isLoading, setIsLoading] = useState(true);
    // const [isMuted, setIsMuted] = useState(false);
    // const [isStarted, setIsStarted] = useState(false);
    // const [isEnded, setIsEnded] = useState(false);

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

    const createPeer = async (userId) => {
        let peer = new RTCPeerConnection({
            iceServers: [
                {
                    urls: "stun:stun.stunprotocol.org",
                },
                {
                    urls: "turn:numb.viagenie.ca",
                    credential: "muazkh",
                    username: "webrtc@live.com",
                },
            ],
        });
        //
        peerRef.current = peer;
        addTracksToPeer(peer);
        }

    const addTracksToPeer = (peer) => {
        userStreamRef.current.getTracks().forEach((track) => {
            peer.addTrack(track, userStreamRef.current);
        }
        );
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
        if(isHost) {
            hostVideoRef.current.srcObject = stream;
            userStreamRef.current = stream;
        } else {
            userVideoRef.current.srcObject = stream;
            userStreamRef.current = stream;
        }
        // socketRef.current = io.connect(`${baseUrl}/room/${roomToken}`);
        // socketRef.current.emit("join room", {
        //     room_token: roomToken,
        //     user_id: user.id,
        //     user_first_name: user.first_name,
        //     user_last_name: user.last_name,
        // });
        // socketRef.current.on("user joined", (data) => {


            
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