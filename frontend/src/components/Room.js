import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect, setError, setMessage } from "../redux/authSlice";
import { useParams } from "react-router-dom";
import VideoElement from "./Video";
import Peer from "simple-peer";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Galleria } from "primereact/galleria";
import { Helmet } from "react-helmet";
import { useNavigate } from "react-router-dom";

const servers = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
    {
      urls: "turn:numb.viagenie.ca",
      credential: "muazkh",
      username: "webrtc@live.com",
    },
  ],
};

const Room = () => {
  const { loading, redirect, isAuthenticated, user } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { roomToken } = useParams();
  const [room, setRoom] = useState({});
  const wsProtocol = window.location.protocol === "https:" ? "wss" : "ws";
  const wsUrl = `${wsProtocol}://${window.location.host}/ws/videorooms/${roomToken}/`;
  const webSocket = useRef();
  const [isHost, setIsHost] = useState(false);
  const localVideo = useRef();
  const [guests, setGuests] = useState([]);
  const guestsRef = useRef([]);
  const hostId = useRef();
  const [isLoading, setIsLoading] = useState(true);
  const [localMicOn, setLocalMicOn] = useState(true);
  const [localCamOn, setLocalCamOn] = useState(true);
  const [guestsMicsOn, setGuestsMicsOn] = useState(true);
  const [mutedGuests, setMutedGuests] = useState([]);
  const mutedGuestsRef = useRef([]);
  const roomMutedRef = useRef(false);
  const selfMutedRef = useRef(false);
  const [allowedToSpeak, setAllowedToSpeak] = useState([]);
  const allowedToSpeakRef = useRef([]);

  const [isFullScreen, setIsFullScreen] = useState(false);
  const toast = useRef();
  const [ restricted, setRestricted ] = useState(false);

  useEffect(() => {
      if(isAuthenticated === false && loading === false) {
          dispatch(setError("You must be logged in to access this page."));
          setRestricted(true);
        }
  }, [isAuthenticated, loading]);

  if(restricted) {
      dispatch(setError("You must be logged in to access this page."));
      navigate("/");
  }

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      const constraints = {
        audio: user.microphone_id ? { deviceId: user.microphone_id } : true,
        video: user.camera_id ? { deviceId: user.camera_id } : true,
      };
      navigator.mediaDevices
        .getUserMedia(constraints)
        .then((stream) => {
          webSocket.current = new WebSocket(wsUrl);
          localVideo.current.srcObject = stream;
          webSocket.current.onopen = () => {
            wsOnOpen();
          };
          webSocket.current.onmessage = (event) => {
            wsOnMessage(event);
          };
          webSocket.current.onclose = (event) => {
            window.location.reload();
          };
          webSocket.current.onerror = (error) => {
            dispatch(setError("Something went wrong or you are not allowed to join this room."));
            // after the toast is hidden, redirect to home page
            setTimeout(() => {
              window.location.href = "/";
            }, 3000);
          };
        })
        .catch((error) => {
          console.log(error);          
        });
    }
  }, [roomToken, isAuthenticated, user]);

  useEffect(() => {
    if (hostId.current) {
      setIsLoading(false);
      reloadLocalVideo();
    }
  }, [hostId.current]);

  
  const sendSignal = (action, message) => {
    let data = {
      peer: user.id,
      action: action,
      message: message,
    };
    webSocket.current.send(JSON.stringify(data));
  };

  const wsOnOpen = () => {
    console.log("Connected to WebSocket");
  };

  const wsOnMessage = (event) => {
    let data = JSON.parse(event.data);
    let action = data.action;
    if (action === "joined") {
      let room = data.room;
      setRoom(room);
      setIsHost(data.is_host);
      hostId.current = room.host;

      let connectedPeers = data.connected_peers;
      Object.entries(connectedPeers).forEach(([peer, channelName]) => {
        if (peer != user.id) {
          if (!guestsRef.current.find((guest) => guest.peer == peer)) {
            createOffer(peer, channelName);
          }
        }
      });
      return;
    }
    let peer = data.peer;

    
    if (action === "room-deleted") {
      if (user.id != hostId.current) {
        
        dispatch(setError("This room has been deleted."));
        
        setTimeout(() => {
          window.location.href = "/";
        }, 3000);
      }
      return;
    }
    let message = data.message;

    if (peer == user.id) {
      return;
    }

    let receiverChannelName = data.message.receiver_channel_name;

    if (action === "new-offer") {
      let offer = message.sdp;
      if (!guestsRef.current.find((guest) => guest.peer == peer)) {
        createAnswer(offer, peer, receiverChannelName);
      }
    }
    if (action === "new-answer") {
      let answer = message.sdp;
      let guest = guestsRef.current.find((guest) => guest.peer == peer);
      guest.peerConnection.signal(answer);
    }
    if (action === "disconnected") {
      deleteGuest(peer);
    }
  };

  const createOffer = (peer, channelName) => {
    let peerConnection = new Peer({
      initiator: true,
      trickle: true,
      stream: localVideo.current.srcObject,
      config: servers,
    });
    peerConnection.on("signal", (signal) => {
      sendSignal("new-offer", {
        sdp: signal,
        receiver_channel_name: channelName,
      });
    });

    peerConnection.on("close", () => {
      deleteGuest(peer);
    });

    peerConnection.on("error", (error) => {
      console.log(error);
    });

    let newGuest = {
      peer: peer,
      channelName: channelName,
      peerConnection: peerConnection,
      isHost: peer == hostId.current,
      audioOn: true,
    };
    guestsRef.current.push(newGuest);
    setGuests((prevGuests) => [...prevGuests, newGuest]);
    peerConnection.on("connect", () => {
      if (selfMutedRef.current === true) {
        sendDataToPeer(peer, {
          type: "i-am-muted",
          peer: user.id,
        });
      }
      if (roomMutedRef.current === true) {
        sendDataToPeer(peer, {
          type: "mute-all",
        });
        mutedGuestsRef.current.push(peer);
        setMutedGuests((prevGuests) => [...prevGuests, peer]);
      }
    });
    peerConnection.on("data", dataChannelOnMessage);
  };

  const createAnswer = (offer, peer, receiverChannelName) => {
    let peerConnection = new Peer({
      initiator: false,
      trickle: true,
      stream: localVideo.current.srcObject,
      config: servers,
    });
    peerConnection.on("signal", (signal) => {
      sendSignal("new-answer", {
        sdp: signal,
        receiver_channel_name: receiverChannelName,
      });
    });
    peerConnection.signal(offer);
    peerConnection.on("close", () => {
      deleteGuest(peer);
    });
    peerConnection.on("error", (error) => {
      console.log(error);
    });
    let newGuest = {
      peer: peer,
      channelName: receiverChannelName,
      peerConnection: peerConnection,
      isHost: peer === hostId.current,
      audioOn: true,
    };
    guestsRef.current.push(newGuest);
    setGuests((prevGuests) => [...prevGuests, newGuest]);
    peerConnection.on("connect", () => {
      if (selfMutedRef.current === true) {
        sendDataToPeer(peer, {
          type: "i-am-muted",
          peer: user.id,
        });
      }
      if (roomMutedRef.current === true) {
        sendDataToPeer(peer, {
          type: "mute-all",
          // peer: user.id,
        });
        mutedGuestsRef.current.push(peer);
        setMutedGuests((prevGuests) => [...prevGuests, peer]);
      }
    });
    peerConnection.on("data", dataChannelOnMessage);
  };

  const sendDataToPeer = (peer, data) => {
    let guest = guestsRef.current.find((guest) => guest.peer == peer);
    if (guest.peerConnection._channelReady) {
      guest.peerConnection.send(JSON.stringify(data));
    } else {
      guest.peerConnection.on("open", () => {
        guest.peerConnection.send(JSON.stringify(data));
      }
      );
    }
  };

  const sendDataToEveryone = (data) => {
    guestsRef.current.forEach((guest) => {
      sendDataToPeer(guest.peer, data);
    });
  };

  const dataChannelOnMessage = (data) => {
    let parsedData = JSON.parse(data.toString());
    let type = parsedData.type;

    if (type === "mute-peer") {
      let peer = parsedData.peer;
      if (peer == user.id && hostId.current != user.id) {
        turnOffYourMic();
        sendDataToEveryone({
          type: "i-am-muted",
          peer: user.id,
        });
      }
      setMutedGuests((prevGuests) => [...prevGuests, peer]);
      mutedGuestsRef.current.push(peer);
      if (roomMutedRef.current) {
        // remove peer from allowed to speak list
        setAllowedToSpeak((prevGuests) =>
          prevGuests.filter((guest) => guest.peer !== peer)
        );
        allowedToSpeakRef.current = allowedToSpeakRef.current.filter(
          (guest) => guest.peer !== peer
        );
      }
    }
    if (type === "unmute-peer") {
      let peer = parsedData.peer;
      if (peer == user.id && hostId.current != user.id) {
        turnOnYourMic();
        sendDataToEveryone({
          type: "i-am-unmuted",
          peer: user.id,
        });
      }
      setMutedGuests((prevGuests) =>
        prevGuests.filter((guest) => guest != peer)
      );
      mutedGuestsRef.current = mutedGuestsRef.current.filter(
        (guest) => guest != peer
      );
      if (roomMutedRef.current) {
        setAllowedToSpeak((prevGuests) => [...prevGuests, peer]);
        allowedToSpeakRef.current.push(peer);
      }
    }
    if (type === "i-am-muted") {
      let peer = parsedData.peer;
      setMutedGuests((prevGuests) => [...prevGuests, peer]);
      mutedGuestsRef.current.push(peer);
      if (roomMutedRef.current) {
        // remove peer from allowed to speak list
        setAllowedToSpeak((prevGuests) =>
          prevGuests.filter((guest) => guest.peer !== peer)
        );
        allowedToSpeakRef.current = allowedToSpeakRef.current.filter(
          (guest) => guest.peer !== peer
        );
      }
    }
    if (type === "i-am-unmuted") {
      let peer = parsedData.peer;
      setMutedGuests((prevGuests) =>
        prevGuests.filter((guest) => guest != peer)
      );
      mutedGuestsRef.current = mutedGuestsRef.current.filter(
        (guest) => guest != peer
      );
      if (roomMutedRef.current) {
        setAllowedToSpeak((prevGuests) => [...prevGuests, peer]);
        allowedToSpeakRef.current.push(peer);
      }
    }
    if (type === "mute-all") {
      setGuestsMicsOn(false);
      roomMutedRef.current = true;
      turnOffYourMic();
      setAllowedToSpeak([]);
      allowedToSpeakRef.current = [];
      if (!isHost) {
        sendDataToEveryone({
          type: "i-am-muted",
          peer: user.id,
        });
      }
    }
    if (type === "unmute-all") {
      setGuestsMicsOn(true);
      roomMutedRef.current = false;
      turnOnYourMic();
      setAllowedToSpeak([]);
      allowedToSpeakRef.current = [];
      if (!isHost) {
        sendDataToEveryone({
          type: "i-am-unmuted",
          peer: user.id,
        });
      }
    }
  };

  const deleteGuest = (peer) => {
    let peerConnection = guestsRef.current.find(
      (guest) => guest.peer == peer
    )?.peerConnection;
    guestsRef.current = guestsRef.current.filter((guest) => guest.peer != peer);
    setGuests((prevGuests) => prevGuests.filter((guest) => guest.peer != peer));
    peerConnection?.removeAllListeners();
    peerConnection?.destroy();
  };

  const reloadLocalVideo = () => {
    const constraints = {
      audio: user.microphone_id ? { deviceId: user.microphone_id } : true,
      video: user.camera_id ? { deviceId: user.camera_id } : true,
    };
    navigator.mediaDevices
      .getUserMedia(constraints)
      .then((stream) => {
        localVideo.current.srcObject = stream;
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // function to mute/unmute sound of all guests
  // this function can be used by the host only
  // every guest will receive the same signal
  const muteAllGuests = () => {
    sendDataToEveryone({
      type: "mute-all",
    });
    setGuestsMicsOn(false);
    roomMutedRef.current = true;
    setAllowedToSpeak([]);
    allowedToSpeakRef.current = [];
  };

  const muteAllGuestsHandler = () => {
    if (isHost) {
      muteAllGuests();
    }
  };

  const unmuteAllGuests = () => {
    sendDataToEveryone({
      type: "unmute-all",
    });
    setGuestsMicsOn(true);
    roomMutedRef.current = false;
    setAllowedToSpeak([]);
    allowedToSpeakRef.current = [];
  };

  const unmuteAllGuestsHandler = () => {
    if (isHost) {
      unmuteAllGuests();
    }
  };

  const turnOnYourCamera = () => {
    guestsRef.current.forEach((guest) => {
      guest.peerConnection.streams[0].getVideoTracks().forEach((track) => {
        track.enabled = true;
      });
    });
    localVideo.current.srcObject.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });
    setLocalCamOn(true);
  };

  const turnOffYourCamera = () => {
    guestsRef.current.forEach((guest) => {
      guest.peerConnection.streams[0].getVideoTracks().forEach((track) => {
        track.enabled = false;
      });
    });
    localVideo.current.srcObject.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    setLocalCamOn(false);
  };

  const turnOnYourMic = () => {
    guestsRef.current.forEach((guest) => {
      guest.peerConnection.streams[0].getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    });
    localVideo?.current?.srcObject?.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    setLocalMicOn(true);
    selfMutedRef.current = false;
  };
  const turnOffYourMic = () => {
    guestsRef.current.forEach((guest) => {
      guest.peerConnection.streams[0].getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    });
    localVideo?.current?.srcObject?.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    setLocalMicOn(false);
    selfMutedRef.current = true;
  };

  const leaveRoom = async () => {
    const response = await axios.post("rooms/leave", {
      room_token: roomToken,
    });
    if (response.status === 200) {
      guestsRef.current.forEach((guest) => {
        guest.peerConnection.removeAllListeners();
        guest.peerConnection.destroy();
      });
      setGuests([]);
      guestsRef.current = [];
      setIsHost(false);
      setLocalCamOn(false);
      setLocalMicOn(false);
      setGuestsMicsOn(false);
      dispatch(setMessage("You left the room"));
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } else {
      dispatch(setError(response.data.message));
    }
  };

  const deleteRoom = async () => {
    const response = await axios.post("rooms/delete", {
      room_token: roomToken,
    });
    if (response.status === 200) {
      sendSignal("room-deleted", {});
      dispatch(setMessage("You deleted the room"));
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    } else {
      toast.current.show({ severity: "error", detail: response.data.message });
    }
  };

  const copyRoomTokenToClipboard = () => {
    navigator.clipboard.writeText(roomToken);
    toast.current.show({
      severity: "success",
      detail: "Room token copied to clipboard",
    });
  };

  const emptyDivsForAbsentGuests = () => {
    let divs = [];
    for (let i = 0; i < room.max_guests - guests.length; i++) {
      divs.push(
        <div
          className={
            room.max_guests === 3
              ? "guest-video-container col-6"
              : room.max_guests === 8
              ? "guest-video-container col-4"
              : "guest-video-container col-3"
          }
          style={
            room.max_guests === 3 ? { height: "50vh" } : { height: "33vh" }
          }></div>
      );
    }
    return divs;
  };

  const muteGuest = (peer) => {
    if (isHost) {
      sendDataToPeer(peer, {
        type: "mute-peer",
        peer,
      });
      setMutedGuests((prevGuests) => {
        return [...prevGuests, peer];
      });
      mutedGuestsRef.current.push(peer);
      setAllowedToSpeak((prevGuests) => {
        return prevGuests.filter((guest) => guest !== peer);
      });
      allowedToSpeakRef.current = allowedToSpeakRef.current.filter(
        (guest) => guest !== peer
      );
    }
  };

  const unmuteGuest = (peer) => {
    if (isHost) {
      sendDataToPeer(peer, {
        type: "unmute-peer",
        peer,
      });
      setMutedGuests((prevGuests) => {
        return prevGuests.filter((guest) => guest !== peer);
      });
      mutedGuestsRef.current = mutedGuestsRef.current.filter(
        (guest) => guest !== peer
      );
      setAllowedToSpeak((prevGuests) => {
        return [...prevGuests, peer];
      });
      allowedToSpeakRef.current.push(peer);
    }
  };

  const peerIsMuted = (peer) => {
    let answer = false;
    if (roomMutedRef.current) {
      answer = true;
      if (allowedToSpeakRef.current.includes(peer)) {
        answer = false;
      }
    } else {
      if (mutedGuestsRef.current.includes(peer)) {
        answer = true;
      }
    }
    return answer;
  };

  const responsiveOptions = [
    {
      breakpoint: "1024px",
      numVisible: 5,
    },
    {
      breakpoint: "768px",
      numVisible: 3,
    },
    {
      breakpoint: "560px",
      numVisible: 2,
    },
  ];

  const carouselVideoTemplate = (guest) => {
    if (!guest?.isHost) {
      return (
        <div className="guest-video-container w-full">
          <VideoElement
            key={guest.peer}
            peerConnection={guest.peerConnection}
          />
          {isHost &&
            (!peerIsMuted(guest.peer) ? (
              <Button
                tooltip="Mute guest"
                className="p-button-rounded p-button-secondary m-2"
                icon="pi pi-volume-up"
                onClick={() => muteGuest(guest.peer)}
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            ) : (
              <Button
                tooltip="Unmute guest"
                className="p-button-rounded p-button-danger m-2"
                icon="pi pi-volume-off"
                onClick={() => unmuteGuest(guest.peer)}
                style={{
                  position: "absolute",
                  bottom: "0",
                  left: "50%",
                  transform: "translateX(-50%)",
                }}
              />
            ))}
          {peerIsMuted(guest.peer) && (
            <div
              style={{
                position: "absolute",
                top: "0",
                right: "0",
                padding: "5px",
              }}>
              <i className="pi pi-volume-off"></i>
              <span style={{ marginLeft: "5px" }}>Muted</span>
            </div>
          )}
        </div>
      );
    }
  };

  const renderGuests = () => {
    let windowWidth = window.innerWidth;
    let screenOrientation = window.window.screen.orientation.type;
    if (windowWidth < 1025 && (screenOrientation === "portrait-primary" || screenOrientation === "portrait-secondary")) {
      return (
        <Galleria
          value={guests.filter((guest) => !guest.isHost)}
          item={carouselVideoTemplate}
          thumbnail={carouselVideoTemplate}
          responsiveOptions={responsiveOptions}
          numVisible={5}
          autoPlay={false}
          circular={false}
          verticalThumbnailViewPortHeight={"50px"}
          style={{width: "100%"}}
          showThumbnails={guests.filter((guest) => !guest.isHost).length > 1}
        />
      );
    } else {
      return (
        <>
          {guests.map((guest, index) => {
            if (!guest.isHost) {
              return (
                <div
                  className={
                    room.max_guests === 3
                      ? "guest-video-container col-6"
                      : room.max_guests === 8
                      ? "guest-video-container col-4"
                      : "guest-video-container col-3"
                  }
                  style={
                    room.max_guests === 3
                      ? { height: "50vh" }
                      : { height: "33vh" }
                  }>
                  <VideoElement
                    key={index}
                    peerConnection={guest.peerConnection}
                  />
                  {isHost &&
                    (!peerIsMuted(guest.peer) ? (
                      <Button
                        tooltip="Mute guest"
                        className="p-button-rounded p-button-secondary m-2"
                        icon="pi pi-volume-up"
                        onClick={() => muteGuest(guest.peer)}
                        style={{
                          position: "absolute",
                          bottom: "0",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                    ) : (
                      <Button
                        tooltip="Unmute guest"
                        className="p-button-rounded p-button-danger m-2"
                        icon="pi pi-volume-off"
                        onClick={() => unmuteGuest(guest.peer)}
                        style={{
                          position: "absolute",
                          bottom: "0",
                          left: "50%",
                          transform: "translateX(-50%)",
                        }}
                      />
                    ))}
                  {peerIsMuted(guest.peer) && (
                    <div
                      style={{
                        position: "absolute",
                        top: "0",
                        right: "0",
                        padding: "5px",
                      }}>
                      <i className="pi pi-volume-off"></i>
                      <span style={{ marginLeft: "5px" }}>Muted</span>
                    </div>
                  )}
                </div>
              );
            }
          })}
          {emptyDivsForAbsentGuests()}
        </>
      );
    }
  };

  const goFullScreen = () => {
    document.getElementsByClassName("room")[0].requestFullscreen();
    setIsFullScreen(true);
  }

  const exitFullScreen = () => {
    document.exitFullscreen();
    setIsFullScreen(false);
  }
  
  return isLoading ? (
    <div className="loading w-12 md:w-4 md:mx-auto overflow-hidden">
      <Toast ref={toast} />
      <video
        ref={localVideo}
        autoPlay
        playsInline
        muted
        className="video-element"
      />
      <div className="loading-text">
        <h1>
          Loading... <i className="pi pi-spinner pi-spin"></i>
        </h1>
      </div>
    </div>
  ) : (
    <div
      className="room"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: "100%",
      }}>
      <Helmet>
        <title>VideoRoom</title>
      </Helmet>
      <Toast ref={toast} />
      <div className="grid grid-nogutter h-full">
        <div
          className={`${(window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? "col-fixed flex-column p-auto  gap-2" : "col-12 flex-row p-3 gap-2"}  room-controls flex justify-content-center align-items-center`}
          style={(window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? { width: "100px" } : {height:"7%"}}>
          {isHost && (
            <Button
              icon="pi pi-copy"
              className="p-button-rounded p-button-secondary p-button-lg"
              tooltip="Copy room token to clipboard to invite others"
              onClick={copyRoomTokenToClipboard}
              style={{width:"2.5rem", height:"2.5rem"}}
            />
          )}
          {localCamOn ? (
            <Button
              tooltip="Turn off your camera"
              className="p-button-rounded p-button-secondary p-button-lg"
              icon="pi pi-video"
              onClick={turnOffYourCamera}
              style={{width:"2.5rem", height:"2.5rem"}}
            />
          ) : (
            <Button
              tooltip="Turn on your camera"
              className="p-button-rounded p-button-danger p-button-lg"
              icon="pi pi-video"
              onClick={turnOnYourCamera}
              style={{width:"2.5rem", height:"2.5rem"}}
            />
          )}
          {!selfMutedRef.current ? (
            <Button
              tooltip="Turn off your mic"
              className="p-button-rounded p-button-secondary p-button-lg"
              icon="pi pi-volume-up"
              style={{width:"2.5rem", height:"2.5rem"}}
              onClick={() => {
                turnOffYourMic();
                sendDataToEveryone({
                  type: "i-am-muted",
                  peer: user.id,
                });
              }}
            />
          ) : (
            <Button
              tooltip="Turn on your mic"
              className="p-button-rounded p-button-danger p-button-lg"
              icon="pi pi-volume-off"
              style={{width:"2.5rem", height:"2.5rem"}}
              onClick={() => {
                turnOnYourMic();
                sendDataToEveryone({
                  type: "i-am-unmuted",
                  peer: user.id,
                });
              }}
              disabled={roomMutedRef.current && !isHost}
            />
          )}
          {isHost &&
            (!roomMutedRef.current ? (
              <Button                
                tooltip="Turn off all mics"
                icon="pi pi-user-minus"
                className="p-button-rounded p-button-secondary p-button-lg"
                onClick={muteAllGuestsHandler}
                style={{width:"2.5rem", height:"2.5rem"}}
              />
            ) : (
              <Button                
                tooltip="Turn on all mics"
                icon="pi pi-user-plus"
                className="p-button-rounded p-button-danger p-button-lg"
                onClick={unmuteAllGuestsHandler}
                style={{width:"2.5rem", height:"2.5rem"}}
              />
            ))}
          {isHost ? (
            <Button
              tooltip="Delete room"
              className="p-button-rounded p-button-danger p-button-lg"
              icon="pi pi-trash"
              onClick={deleteRoom}
              style={{width:"2.5rem", height:"2.5rem"}}
            />
          ) : (
            <Button
              tooltip="Leave room"
              className="p-button-rounded p-button-danger p-button-lg"
              icon="pi pi-power-off"
              onClick={leaveRoom}
              style={{width:"2.5rem", height:"2.5rem"}}
            />
          )}
          {isFullScreen ? (
            <Button
              tooltip="Exit full screen"
              className="p-button-rounded p-button-secondary p-button-lg"
              icon="pi pi-window-minimize"
              onClick={exitFullScreen}
              style={{width:"2.5rem", height:"2.5rem"}}
            />
          ) : (
            <Button
              tooltip="Full screen"
              className="p-button-rounded p-button-secondary p-button-lg"
              icon="pi pi-window-maximize"
              onClick={goFullScreen}
              style={{width:"2.5rem", height:"2.5rem"}}
            />
          )}
        </div>
        <div 
          className={`${(window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? "col" : "col-12"} grid grid-nogutter`} 
          style={(window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? { height: "100%" } : {height:"93%"}}
          >
          <div
            className={
              (window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? (
                room.max_guests === 3
                ? "host-video-container col-6"
                : room.max_guests === 8
                ? "host-video-container col-4"
                : "host-video-container col-3"
                ) : (
                "host-video-container col-12"
                )
            }
            style={
              (window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? (
                room.max_guests === 3 ? { height: "50vh" } : { height: "33vh" }
                ) : (isHost ? { height: "50%" } : { height: "auto" })
            }>
            {isHost ? (
              <video
                ref={localVideo}
                autoPlay
                playsInline
                muted
                className="video-element"
              />
            ) : (
              guests.map((guest, index) => {
                if (guest.isHost) {
                  return (
                    <VideoElement
                      key={index}
                      peerConnection={guest.peerConnection}
                      muted={mutedGuests.includes(guest.peer)}
                    />
                  );
                }
              })
            )}
            {isHost && selfMutedRef.current && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  padding: "5px",
                }}>
                <i className="pi pi-volume-off"></i>
                <span style={{ marginLeft: "5px" }}>Muted</span>
              </div>
            )}
            {!isHost && peerIsMuted(hostId.current) && (
              <div
                style={{
                  position: "absolute",
                  top: "0",
                  right: "0",
                  padding: "5px",
                }}>
                <i className="pi pi-volume-off"></i>
                <span style={{ marginLeft: "5px" }}>Muted</span>
              </div>
            )}
          </div>
          {!isHost && (
            <div
              className={
                (window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? (
                  room.max_guests === 3
                  ? "guest-video-container col-6"
                  : room.max_guests === 8
                  ? "guest-video-container col-4"
                  : "guest-video-container col-3"
                  ) : (
                  "guest-video-container col-12"
                  )
              }
              style={
                (window.innerWidth > 1024 || (window.screen.orientation.type === "landscape-primary" || window.screen.orientation.type === "landscape-secondary")) ? (
                  room.max_guests === 3 ? { height: "50vh" } : { height: "33vh" }
                  ) : { height: "auto" }
              }>
              <video
                ref={localVideo}
                autoPlay
                playsInline
                muted
                className="video-element"
              />
              {selfMutedRef.current && (
                <div
                  style={{
                    position: "absolute",
                    top: "0",
                    right: "0",
                    padding: "5px",
                  }}>
                  <i className="pi pi-volume-off"></i>
                  <span style={{ marginLeft: "5px" }}>Muted</span>
                </div>
              )}
            </div>
          )}          
          {renderGuests()}
        </div>
      </div>
    </div>
  );
};

export default Room;
