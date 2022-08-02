import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import RotateLoader from "react-spinners/RotateLoader";
import { useParams } from "react-router-dom";
import * as ReactDOM from 'react-dom';
import VideoElement from "./Video";

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
  const localVideo = useRef();
  const [guests, setGuests] = useState([]);
  const guestsRef = useRef({});
  const [remoteVideos, setRemoteVideos] = useState([]);
  const [peerConnections, setPeerConnections] = useState([]);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      webSocket.current = new WebSocket(wsUrl);
      webSocket.current.onopen = () => {
        console.log("connected");
        wsOnOpen();
      };
      webSocket.current.onmessage = (event) => {
        wsOnMessage(event);
      };
      webSocket.current.onclose = () => {
        console.log("disconnected");
      };
      webSocket.current.onerror = (error) => {
        console.log(error);
      };
    }
  }, [roomToken, isAuthenticated, user]);

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
    sendSignal("new-peer", {});
    getUserMedia();
  };

  const wsOnMessage = (event) => {
    let data = JSON.parse(event.data);
    let action = data.action;
    if (action === "joined") {
      console.log("joined");
      console.log(data);
      let room = data.room;
      setRoom(room);
      return;
    }
    let peer = data.peer;
    let message = data.message;

    

    if (peer === user.id) {
      return;
    }

    let receiver_channel_name = data.message.receiver_channel_name;

    if (action === "new-peer") {
      createOffer(peer, receiver_channel_name);
      return;
    }
    if (action === "new-offer") {
      let offer = data["message"]["sdp"];

      createAnswer(offer, peer, receiver_channel_name);
    }
    if (action === "new-answer") {
      let answer = data["message"]["sdp"];
      let peer_connection = guestsRef.current[peer].peer_connection;
      peer_connection.setRemoteDescription(answer);
      console.log(peer_connection);
    }
  };

  const createOffer = (peer, receiver_channel_name) => {
    let peer_connection = new RTCPeerConnection(servers);

    addLocalTracks(peer_connection);

    let dataChannel = peer_connection.createDataChannel("data-channel");
    dataChannel.onopen = () => {
        console.log("data channel open");
    };
    dataChannel.onclose = () => {
        console.log("data channel closed");
    };
    dataChannel.onmessage = (event) => {
        console.log(event.data);
        dcOnMessage(event);
    };
    dataChannel.onerror = (error) => {
        console.log(error);
    };
    guestsRef.current[peer] = {
        peer_connection: peer_connection,
        data_channel: dataChannel,
        receiver_channel_name: receiver_channel_name,
    };
    setGuests([...guests, peer]);

    

    peer_connection.oniceconnectionstatechange = () => {
        let state = peer_connection.iceConnectionState;

        if (state === "disconnected" || state === "failed") {
            console.log("disconnected");
            peer_connection.close();
            deleteGuest(peer);
            if(state !== "closed"){
                peer_connection.close();
            }

        }
    };

    peer_connection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log("ice candidate", event.candidate);
            return;
        }
        sendSignal("new-offer", {
            sdp: peer_connection.localDescription,
            receiver_channel_name: receiver_channel_name,
        });
    };

    peer_connection.createOffer().then((offer) => {
        peer_connection.setLocalDescription(offer);
    }).then(() => {
        console.log("offer created");
    });

    setPeerConnections([...peerConnections, peer_connection]);

    // peer_connection.addEventListener("track", pcOnTrack);
  };

  const createAnswer = (offer, peer, receiver_channel_name) => {
    let peer_connection = new RTCPeerConnection(servers);

    addLocalTracks(peer_connection);

    
    peer_connection.ondatachannel = (event) => {
        peer_connection.dc = event.channel;
        peer_connection.dc.onopen = () => {
            console.log("data channel open");
        };
        peer_connection.dc.onclose = () => {
            console.log("data channel closed");
        };
        peer_connection.dc.onmessage = (event) => {
            console.log(event.data);
            dcOnMessage(event);
        };
        peer_connection.dc.onerror = (error) => {
            console.log(error);
        };

        guestsRef.current[peer] = {
            peer_connection: peer_connection,
            data_channel: peer_connection.dc,
            receiver_channel_name: receiver_channel_name,
        };

        setGuests([...guests, peer]);
    };

    peer_connection.oniceconnectionstatechange = () => {
        let state = peer_connection.iceConnectionState;

        if (state === "disconnected" || state === "failed") {
            console.log("disconnected");
            peer_connection.close();
            deleteGuest(peer);
            if (state !== "closed") {
                peer_connection.close();
            }

        }
    };

    peer_connection.onicecandidate = (event) => {
        if (event.candidate) {
            console.log(event.candidate, 'candidate');
            return;
        }
        
        sendSignal("new-answer", {
            sdp: peer_connection.localDescription,
            receiver_channel_name: receiver_channel_name,
        });
    };

    peer_connection.setRemoteDescription(offer).then(() => {
        console.log("Set remote description");
        return peer_connection.createAnswer();
    }).then((answer) => {
        console.log("Created answer");
        peer_connection.setLocalDescription(answer);
    });

    setPeerConnections([...peerConnections, peer_connection]);
    // peer_connection.addEventListener("track", pcOnTrack);

  };

    const addLocalTracks = (peer_connection) => {
        localVideo?.current?.srcObject?.getTracks().forEach((track) => {
            peer_connection.addTrack(track, localVideo.current.srcObject);
        });
        return;
    };

    const dcOnMessage = (event) => {
        let data = event.data;
        console.log(data);
    };

    const deleteGuest = (peer) => {
        let index = guests.indexOf(peer);
        guests.splice(index, 1);
        let remoteVideo = document.getElementById(peer);
        // ReactDOM.unmountComponentAtNode(remoteVideo);
        // remoteVideo.remove();
        setRemoteVideos([...remoteVideos.slice(0, index), ...remoteVideos.slice(index + 1)]);
        delete guestsRef.current[peer];
    };

    const getUserMedia = () => {
        navigator.mediaDevices.getUserMedia({
            audio: true,
            video: true,
        }).then((stream) => {
            localVideo.current.srcObject = stream;
            // localVideo.current.play();
        }).catch((error) => {
            console.log(error);
        });
    };

    // const pcOnTrack = (event) => {
    //     console.log("ontrack");
    //     let stream = event.streams[0];
    //     console.log(stream);
    //     let video = <React.Fragment>
    //         <video autoPlay playsInline id={event.track.id} />
    //     </React.Fragment>;
    //     setRemoteVideos([...remoteVideos, video]);

    //     // ReactDOM.render(video, document.getElementsByClassName("remote-video")[0]);
    //     // setRemoteVideos([...remoteVideos, video]);
    // }

    return (
        <div className="video-chat">
            <div className="video-chat-container">
                <div className="video-chat-left">
                    <div className="video-chat-left-container">
                        <div className="video-chat-left-container-video">
                            <video ref={localVideo} autoPlay playsInline muted />
                        </div>
                    </div>
                </div>
                <div className="video-chat-right">
                    <div className="video-chat-right-container">
                        {peerConnections.map((peer_connection, index) => {
                            return (
                                <VideoElement key={index} peer_connection={peer_connection} />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    )
};

export default Room;