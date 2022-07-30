import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
// import UserLayout from "../layouts/UserLayout";
import RotateLoader from "react-spinners/RotateLoader";
import baseUrl from "../api/axios";
import { useParams } from "react-router-dom";

const servers = {
  iceServers: [
    {
      urls: "stun:openrelay.metered.ca:80",
    },
    {
      urls: "turn:openrelay.metered.ca:80",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
    {
      urls: "turn:openrelay.metered.ca:443?transport=tcp",
      username: "openrelayproject",
      credential: "openrelayproject",
    },
  ],
};

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
  const [isHost, setIsHost] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const [hostStream, setHostStream] = useState(null);
  const [guests, setGuests] = useState({});
  const [guestVideos, setGuestVideos] = useState([]);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      const response = axios
        .get("rooms/get", {
          params: {
            room_token: roomToken,
          },
        })
        .then((res) => {
          setRoom(res.data);
          if (res.data.host === user.id) {
            setIsHost(true);
            setHostStream(new MediaStream());
          }
          // setIsHost(res.data.host === user.id);

          webSocket.current = new WebSocket(wsUrl);
          webSocket.current.onopen = () => {
            console.log("Connected to WebSocket");
            console.log(user);
            console.log(roomToken);
            console.log(room);
          };
          webSocket.current.onmessage = (event) => {
            console.log(event.data);
          };
          webSocket.current.onclose = () => {
            console.log("Disconnected from WebSocket");
          };
        })
        .catch((err) => {
          console.log(err);
        });
      // console.log(response);
      // console.log(response.data);
      // setRoom(response.data);
    }
  }, [roomToken, isAuthenticated, user]);

  // useEffect(() => {
  //   if (isAuthenticated && user) {
  //     // open websocket connection sending cookies to the server
  //     webSocket.current = new WebSocket(wsUrl);
  //     webSocket.current.onopen = () => {
  //       console.log("Connected to WebSocket");
  //       console.log(user);
  //       console.log(roomToken);
  //       console.log(room);
  //     }
  //     webSocket.current.onmessage = (event) => {
  //       console.log(event.data);
  //     }
  //     webSocket.current.onclose = () => {
  //       console.log("Disconnected from WebSocket");
  //     }
  //   }
  // }, [room, isAuthenticated, user]);

  const sendSignal = (action, message) => {
    let data = {
      peer: user.id,
      action: action,
      message: message,
    };
    webSocket.current.send(JSON.stringify(data));
  };

  const wsOnMessage = (event) => {
    let data = JSON.parse(event.data);
    let peer = data.peer;
    let action = data.action;
    let message = data.message;

    if (peer === user.id) {
      return;
    }

    let receiver_channel_name = data.message.receiver_channel_name;

    if (action === "new-peer") {
      createOffer(peer, receiver_channel_name);
    }
  };

  const wsOnOpen = () => {
    console.log("Connected to WebSocket");
    sendSignal("new-peer", {});
  };

  const createOffer = (peer, receiver_channel_name) => {
    let peer_connection = new RTCPeerConnection(servers);

    addLocalTracks(peer_connection);

    let dataChannel = peer_connection.createDataChannel("data-channel");
    dataChannel.onopen = () => {
      console.log("data-channel open");
    };
    dataChannel.onclose = () => {
      console.log("data-channel closed");
    };
    dataChannel.onmessage = (event) => {
      console.log(event.data);
      dcOnMessage(event);
    };

    let remoteVideo = createVideo(peer);
    setOnTrack(peer_connection, remoteVideo);

    setGuests((prevGuests) => {
      return {
        ...prevGuests,
        [peer]: {
          peer_connection,
          dataChannel,
        },
      };
    });

    peer_connection.oniceconnectionstatechange = () => {
      let iceConnectionState = peer_connection.iceConnectionState;

      if (
        iceConnectionState === "disconnected" ||
        iceConnectionState === "failed"
      ) {
        console.log("iceConnectionState: " + iceConnectionState);
        peer_connection.close();
        deleteGuest(peer);
        if (iceConnectionState !== "closed") {
          peer_connection.close();
        }
      }
    };
  };

  const addLocalTracks = (peer_connection) => {
    if (isHost && hostStream) {
      hostStream.getTracks().forEach((track) => {
        peer_connection.addTrack(track, hostStream);
      });
      return;
    }
    if (localStream) {
      localStream.getTracks().forEach((track) => {
        peer_connection.addTrack(track, localStream);
      });
      return;
    }
  };

  const dcOnMessage = (event) => {
    let message = event.data;
  };

  const createVideo = (peer) => {
    let video = document.createElement("video");
    video.id = `video-${peer}`;
    video.autoplay = true;
    video.playsInline = true;

    setGuestVideos((prevState) => [...prevState, video]);
  };

  const setOnTrack = (peer_connection, remoteVideo) => {
    let remoteStream = new MediaStream();

    remoteVideo.srcObject = remoteStream;
    peer_connection.ontrack = async (event) => {
      remoteStream.addTrack(event.track, remoteStream);
    };
  };

  const deleteGuest = (peer) => {
    setGuests((prevGuests) => {
      return {
        ...prevGuests,
        [peer]: {
          peer_connection: null,
          dataChannel: null,
        },
      };
    });
    setGuestVideos((prevState) => {
      return prevState.filter((video) => video.id !== `video-${peer}`);
    });
  };

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
  ) : isAuthenticated && room ? (
    <div>
      <h1>{room.id}</h1>
      <h2>{isHost ? "You are the host" : "You are not the host"}</h2>
    </div>
  ) : (
    <div>
      <h1>You are not logged in</h1>
    </div>
  );
};

export default Room;
