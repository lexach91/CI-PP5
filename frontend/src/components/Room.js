import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import RotateLoader from "react-spinners/RotateLoader";
import { useParams } from "react-router-dom";
import * as ReactDOM from "react-dom";
import VideoElement from "./Video";
import Peer from "simple-peer";
import { ContextMenu } from "primereact/contextmenu";
import { Button } from "primereact/button";
import { Dock } from "primereact/dock";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { Toast } from "primereact/toast";

// const servers = {
//   iceServers: [
//     {
//       urls: "stun:openrelay.metered.ca:80",
//     },
//     {
//       urls: "turn:openrelay.metered.ca:80",
//       username: "openrelayproject",
//       credential: "openrelayproject",
//     },
//     {
//       urls: "turn:openrelay.metered.ca:443",
//       username: "openrelayproject",
//       credential: "openrelayproject",
//     },
//     {
//       urls: "turn:openrelay.metered.ca:443?transport=tcp",
//       username: "openrelayproject",
//       credential: "openrelayproject",
//     },
//   ],
// };

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

  const [isFullScreen, setIsFullScreen] = useState(false);
  const toast = useRef();

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      navigator.mediaDevices
        .getUserMedia({
          audio: true,
          video: true,
        })
        .then((stream) => {
          webSocket.current = new WebSocket(wsUrl);
          localVideo.current.srcObject = stream;
          console.log(stream);
          webSocket.current.onopen = () => {
            console.log("Websocket connected");
            wsOnOpen();
          };
          webSocket.current.onmessage = (event) => {
            wsOnMessage(event);
          };
          webSocket.current.onclose = (event) => {
            console.log(event);
            console.log("Websocket disconnected");
          };
          webSocket.current.onerror = (error) => {
            console.log(error, "Websocket error");
            toast.current.show({
              severity: "error",
              detail: "Something went wrong or you are not allowed to join this room.",
            });
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

  // set isLoading to false when we have a hostId
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
    console.log(data);
    let action = data.action;
    if (action === "joined") {
      console.log("joined");
      console.log(data);
      let room = data.room;
      setRoom(room);
      setIsHost(data.is_host);
      hostId.current = room.host;
      let connectedPeers = data.connected_peers;
      Object.entries(connectedPeers).forEach(([peer, channelName]) => {
        console.log(peer, channelName);
        if (peer != user.id) {
          console.log("new peer huiyr");
          console.log(peer);
          console.log(user.id);
          createOffer(peer, channelName);
        }
      });
      return;
    }
    let peer = data.peer;

    if (action === "mute-all") {
      console.log("mute-all");
      if (user.id != hostId.current) {
        console.log("mute-all host");
        turnOffYourMic();
      }
      return;
    }
    if (action === "unmute-all") {
      console.log("unmute-all");
      if (user.id != hostId.current) {
        console.log("unmute-all host");
        turnOnYourMic();
      }
      return;
    }
    if (action === "room-deleted") {
      console.log("room-deleted");
      if (user.id != hostId.current) {
        toast.current.show({
          severity: "error",
          detail: "This room has been deleted.",
        });
        // after the toast is hidden, redirect to home page
        setTimeout(() => {
          window.location.href = "/";
        } , 3000);
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
      createAnswer(offer, peer, receiverChannelName);
      console.log(guestsRef.current);
      console.log(guests);
    }
    if (action === "new-answer") {
      console.log("new-answer");
      let answer = message.sdp;
      console.log(guestsRef.current);
      console.log(peer);
      let guest = guestsRef.current.find((guest) => guest.peer == peer);
      console.log(guest);
      guest.peerConnection.signal(answer);
      console.log(guestsRef.current);
      console.log(guests);
    }
    if (action === "disconnected") {
      console.log(`${peer} disconnected`);
      deleteGuest(peer);
    }
  };

  const createOffer = (peer, channelName) => {
    let peerConnection = new Peer({
      initiator: true,
      trickle: false,
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
      console.log("peerConnection closed");
      deleteGuest(peer);
    });

    let newGuest = {
      peer: peer,
      channelName: channelName,
      peerConnection: peerConnection,
      isHost: peer == hostId.current,
      audioOn: true,
      videoOn: true,
    };
    guestsRef.current.push(newGuest);
    setGuests((prevGuests) => [...prevGuests, newGuest]);
    console.log(guestsRef.current);
    console.log(guests);
  };

  const createAnswer = (offer, peer, receiverChannelName) => {
    let peerConnection = new Peer({
      initiator: false,
      trickle: false,
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
    // peerConnection.on("close", () => {
    //   console.log("peerConnection closed");
    //   deleteGuest(peer);
    // });
    let newGuest = {
      peer: peer,
      channelName: receiverChannelName,
      peerConnection: peerConnection,
      isHost: peer === hostId.current,
      audioOn: false,
      videoOn: false,
    };
    guestsRef.current.push(newGuest);
    setGuests((prevGuests) => [...prevGuests, newGuest]);
    console.log(guestsRef.current);
    console.log(guests);
  };

  const deleteGuest = (peer) => {
    let peerConnection = guestsRef.current.find(
      (guest) => guest.peer == peer
    )?.peerConnection;
    guestsRef.current = guestsRef.current.filter((guest) => guest.peer != peer);
    setGuests((prevGuests) => prevGuests.filter((guest) => guest.peer != peer));
    peerConnection?.removeAllListeners();
    peerConnection?.destroy();
    console.log(guestsRef.current);
    console.log(guests);
  };

  const reloadLocalVideo = () => {
    navigator.mediaDevices
      .getUserMedia({
        video: true,
        audio: true,
      })
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
    sendSignal("mute-all", {});
  };

  const muteAllGuestsHandler = () => {
    if (isHost) {
      muteAllGuests();
      setGuestsMicsOn(false);
    }
  };

  const unmuteAllGuests = () => {
    sendSignal("unmute-all", {});
  };

  const unmuteAllGuestsHandler = () => {
    if (isHost) {
      unmuteAllGuests();
      setGuestsMicsOn(true);
    }
  };

  const turnOnYourCamera = () => {
    // let localVideoTrack = localVideo.current.srcObject.getVideoTracks()[0];
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
    // let localVideoTrack = localVideo.current.srcObject.getVideoTracks()[0];
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
    // let localAudioTrack = localVideo.current.srcObject.getAudioTracks()[0];
    guestsRef.current.forEach((guest) => {
      guest.peerConnection.streams[0].getAudioTracks().forEach((track) => {
        track.enabled = true;
      });
    });
    localVideo.current.srcObject.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    setLocalMicOn(true);
  };
  const turnOffYourMic = () => {
    // let localAudioTrack = localVideo.current.srcObject.getAudioTracks()[0];
    guestsRef.current.forEach((guest) => {
      guest.peerConnection.streams[0].getAudioTracks().forEach((track) => {
        track.enabled = false;
      });
    });
    localVideo.current.srcObject.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    setLocalMicOn(false);
  };

  const leaveRoom = async () => {
    const response = await axios.post(
      "rooms/leave",
      {
        room_token: roomToken,
      }
    );
    if (response.status === 200) {
      toast.current.show({severity: "success", detail: "You left the room"});
      // destroy all guests
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
      setTimeout(() => {
        window.location.href = "/";
      } , 3000);
    } else {
      console.log(response);
      toast.current.show({severity: "error", detail: response.data.message});
    }
  };

  const deleteRoom = async () => {
    const response = await axios.post(
      "rooms/delete",
      {
        room_token: roomToken,
      }
    );
    if (response.status === 200) {
      sendSignal("room-deleted", {});
      toast.current.show({severity: "success", detail: "You deleted the room"});
      setTimeout(() => {
        window.location.href = "/";
      } , 3000);
    } else {
      console.log(response);
      toast.current.show({severity: "error", detail: response.data.message});
    }
  };

  const copyRoomTokenToClipboard = () => {
    navigator.clipboard.writeText(roomToken);
    toast.current.show({severity: "success", detail: "Room token copied to clipboard"});
  };

  // return isLoading ? (
  //     <div className="loading">
  //       <video
  //         ref={localVideo}
  //         autoPlay
  //         playsInline
  //         muted
  //         className="video-element"
  //       />
  //       <div className="loading-text">
  //         <h1>
  //           Loading... <i className="pi pi-spinner pi-spin"></i>
  //         </h1>
  //       </div>
  //     </div>

  //     ) : (
  //   <div className="room">
  //     <div className="room-header">
  //       <h1>{room.id}</h1>
  //       <h2>{isHost ? "You are host" : "You are guest"}</h2>
  //     </div>
  //     <div className="room-body">
  //       <video
  //         ref={localVideo}
  //         autoPlay
  //         playsInline
  //         muted
  //         className="video-element"
  //       />
  //       {guests.map((guest, index) => {
  //         return (
  //           <VideoElement
  //             key={index}
  //             peerConnection={guest.peerConnection}
  //           />
  //         );
  //       })}
  //     </div>
  //   </div>
  // );
  return isLoading ? (
    <div className="loading">
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
      <Toast ref={toast} />
      <div className="grid grid-nogutter">
        <div className="col-fixed room-controls" style={{ width: "100px" }}>
          {isHost && (
            <Button
              icon="pi pi-copy"
              title="Copy room token"
              onClick={copyRoomTokenToClipboard}
            />
          )}
          {localCamOn ? (
            <Button
              label="Turn off your camera"
              icon="pi pi-video"
              onClick={turnOffYourCamera}
            />
          ) : (
            <Button
              label="Turn on your camera"
              icon="pi pi-video"
              onClick={turnOnYourCamera}
            />
          )}
          {localMicOn ? (
            <Button
              label="Turn off your mic"
              icon="pi pi-volume-off"
              onClick={turnOffYourMic}
            />
          ) : (
            <Button
              label="Turn on your mic"
              icon="pi pi-volume-up"
              onClick={turnOnYourMic}
            />
          )}
          {isHost && ( guestsMicsOn ? (
            <Button
              label="Mute all guests"
              icon="pi pi-volume-off"
              onClick={muteAllGuestsHandler}
            />            
          ) : (
            <Button
              label="Unmute all guests"
              icon="pi pi-volume-up"
              onClick={unmuteAllGuestsHandler}
            />
          ))}
          {isHost ? (
            <Button
              label="Delete room"
              icon="pi pi-trash"
              onClick={deleteRoom}
            />
          ) : (
            <Button
              label="Leave room"
              icon="pi pi-power-off"
              onClick={leaveRoom}
            />
          )}
        </div>
        <div className="col grid grid-nogutter">
          <div className="host-video-container col-6 md:col-4 lg:col-3">
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
                    />
                  );
                }
              })
            )}
          </div>
          {!isHost ? (
            <div className="guest-video-container col-6 md:col-4 lg:col-3">
              <video
                ref={localVideo}
                autoPlay
                playsInline
                muted
                className="video-element"
              />
            </div>
          ) : (
            <></>
          )}
          {guests.map((guest, index) => {
            if (!guest.isHost) {
              return (
                <div className="guest-video-container col-6 md:col-4 lg:col-3">
                  <VideoElement
                    key={index}
                    peerConnection={guest.peerConnection}
                  />
                </div>
              );
            }
          })}
        </div>
      </div>
    </div>
  );
};

export default Room;
