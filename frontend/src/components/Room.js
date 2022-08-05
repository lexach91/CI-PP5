import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import RotateLoader from "react-spinners/RotateLoader";
import { useParams } from "react-router-dom";
import * as ReactDOM from "react-dom";
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
    // {
    //   urls: "turn:openrelay.metered.ca:443",
    //   username: "openrelayproject",
    //   credential: "openrelayproject",
    // },
    // {
    //   urls: "turn:openrelay.metered.ca:443?transport=tcp",
    //   username: "openrelayproject",
    //   credential: "openrelayproject",
    // },
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
  // const [remoteVideos, setRemoteVideos] = useState([]);
  // const [peerConnections, setPeerConnections] = useState([]);
  // const hostVideo = useRef();
  const hostId = useRef();

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      getUserMedia();
      // navigator.mediaDevices
      //   .getUserMedia({ audio: true, video: true })
      //   .then((stream) => {
      //     localVideo.current.srcObject = stream;
      //     webSocket.current = new WebSocket(wsUrl);
      //     webSocket.current.onopen = () => {
      //       console.log("connected");
      //       wsOnOpen();
      //     };
      //     webSocket.current.onmessage = (event) => {
      //       wsOnMessage(event);
      //     };
      //     webSocket.current.onclose = () => {
      //       console.log("disconnected");
      //     };
      //     webSocket.current.onerror = (error) => {
      //       console.log(error);
      //     };
      //   })
      //   .catch((error) => {
      //     console.log(error);
      //   });
    }
  }, [roomToken, isAuthenticated, user]);

  useEffect(() => {
    if (room.host) {
      hostId.current = room.host;
      setIsHost(user.id === room.host);
    }
  }, [room]);

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
      // check if the peer is already in the peerConnections
      // let guest = guestsRef.current[peer];
      // if (guest) {
      //   guest.peer_connection.setRemoteDescription(answer);
      // } else {
      //   createOffer(peer, receiver_channel_name);
      // }

      let guest = guestsRef.current[peer];
      console.log(guest);
      // if (guest) {
      guest.peer_connection.setRemoteDescription(answer);
      console.log("new-answer");
      // }
      // let peer_connection = guestsRef.current[peer].peer_connection;
      // peer_connection.setRemoteDescription(answer);
      // console.log(peer_connection);
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
    let guest = {
      peer: peer,
      peer_connection: peer_connection,
      data_channel: dataChannel,
      receiver_channel_name: receiver_channel_name,
      isHost: peer === hostId.current,
    };
    setGuests((prevGuests) => [...prevGuests, guest]);
    guestsRef.current[peer] = {
      peer_connection: peer_connection,
      data_channel: dataChannel,
      receiver_channel_name: receiver_channel_name,
      isHost: peer === hostId.current,
    };
    // setGuests([...guests, peer]);

    peer_connection.oniceconnectionstatechange = () => {
      let state = peer_connection.iceConnectionState;

      if (state === "disconnected" || state === "failed") {
        console.log("state: " + state);
        deleteGuest(peer);
        peer_connection.close();
      } else {
        console.log("state: " + state);
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
        // is_host: isHost,
      });
    };

    peer_connection
      .createOffer()
      .then((offer) => {
        peer_connection.setLocalDescription(offer);
      })
      .then(() => {
        console.log("offer created");
      });

    peer_connection.onnegotiationneeded = () => {
      console.log("onnegotiationneeded");
    };

    // let guestPeer = {
    //   peer_connection: peer_connection,
    //   isHost: peer === hostId.current,
    // };

    // console.log(guestPeer, "guestPeer");
    // console.log(peer, "peer");
    // console.log(user.id, "user.id");
    // console.log(hostId.current, "room.host");

    // peerConnections.push(guestPeer);
    // setPeerConnections(peerConnections);

    // setPeerConnections([...peerConnections, guestPeer]);

    // setPeerConnections([...peerConnections, peer_connection]);

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
      let guest = {
        peer: peer,
        peer_connection: peer_connection,
        data_channel: peer_connection.dc,
        receiver_channel_name: receiver_channel_name,
        isHost: peer === hostId.current,
      };
      setGuests((prevGuests) => [...prevGuests, guest]);

      guestsRef.current[peer] = {
        peer_connection: peer_connection,
        data_channel: peer_connection.dc,
        receiver_channel_name: receiver_channel_name,
        isHost: peer === hostId.current,
      };

      // setGuests([...guests, peer]);
    };

    peer_connection.oniceconnectionstatechange = () => {
      let state = peer_connection.iceConnectionState;

      if (state === "disconnected" || state === "failed") {
        console.log("state: " + state);
        deleteGuest(peer);
        peer_connection.close();
      } else {
        console.log("state: " + state);
      }
    };

    peer_connection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(event.candidate, "candidate");
        return;
      }

      sendSignal("new-answer", {
        sdp: peer_connection.localDescription,
        receiver_channel_name: receiver_channel_name,
        // is_host: isHost,
      });
    };

    peer_connection
      .setRemoteDescription(offer)
      .then(() => {
        console.log("Set remote description");
        return peer_connection.createAnswer();
      })
      .then((answer) => {
        console.log("Created answer");
        peer_connection.setLocalDescription(answer);
      });

    peer_connection.onnegotiationneeded = () => {
      console.log("onnegotiationneeded");
    };
    // let guestPeer = {
    //   peer_connection: peer_connection,
    //   isHost: peer === hostId.current,
    // };
    // console.log(guestPeer, "guestPeer");
    // console.log(peer, "peer");
    // console.log(user.id, "user.id");
    // console.log(hostId.current, "room.host");

    // peerConnections.push(guestPeer);
    // setPeerConnections(peerConnections);

    // setPeerConnections([...peerConnections, guestPeer]);

    // setPeerConnections([...peerConnections, peer_connection]);
    // peer_connection.addEventListener("track", pcOnTrack);
  };


  const addLocalTracks = (peer_connection) => {
    localVideo.current.srcObject.getTracks().forEach((track) => {
      peer_connection.addTrack(track, localVideo.current.srcObject);
      console.log("track added", track);
    });
    return;
  };


  const dcOnMessage = (event) => {
    let data = event.data;
    console.log(data);
  };

  const deleteGuest = (peer) => {
    setGuests((prevGuests) => prevGuests.filter((guest) => guest.peer !== peer));
    delete guestsRef.current[peer];
  };

  // const deleteGuest = (peer) => {
  //   let index = guests.indexOf(peer);
  //   guests.splice(index, 1);
  //   let remoteVideo = document.getElementById(peer);
  //   // ReactDOM.unmountComponentAtNode(remoteVideo);
  //   // remoteVideo.remove();
  //   setRemoteVideos([
  //     ...remoteVideos.slice(0, index),
  //     ...remoteVideos.slice(index + 1),
  //   ]);
  //   delete guestsRef.current[peer];
  // };

  const getUserMedia = () => {
    // let getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
    navigator.mediaDevices
      .getUserMedia({
        audio: true,
        video: true,
      })
      .then((stream) => {
        localVideo.current.srcObject = stream;
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
      })
      .catch((error) => {
        console.log(error);
      });
  };

  // const getUserMedia = async () => {
  //   try {
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       audio: true,
  //       video: true,
  //     });
  //     localVideo.current.srcObject = stream;
  //     // localVideo.current.play();
  //     return true;
  //   } catch (error) {
  //     console.log(error);
  //     return false;
  //   }
  // };

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
      <h2>Room: {room.id}</h2>
      <h2>Guests: {guests.length}</h2>
      {/* <h2>Guests ref: {Object.keys(guestsRef.current).length}</h2> */}
      <p>
        There are these guests in room:
        {guests.map((guest) => (
          <span key={guest.peer}>|{guest.peer}|</span>
        ))}
      </p>
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
            {/* {peerConnections.map((peerGuest, index) => {
                          return (
                            <>
                              <VideoElement key={index} peer_connection={peerGuest.peer_connection} />
                              <p>{peerGuest.isHost ? ("HOST") : ("NOT HOST")}</p>
                            </>
                          );
                      })} */}
            {/* {Object.keys(guestsRef.current).map((peerGuest, index) => {
                        return (
                          <>
                            <VideoElement key={index} peer_connection={guestsRef.current[peerGuest].peer_connection} />
                            <p>{guestsRef.current[peerGuest].isHost ? ("HOST") : ("NOT HOST")}</p>
                          </>
                        );
                      })} */}
            {guests.map((guest) => {
              return (
                <>
                  <VideoElement
                    key={guest.peer}
                    guest={guest}
                  />
                  <p>{guest.isHost ? "HOST" : "NOT HOST"}</p>
                  <p>Stream exists:
                    {guest.peer_connection.getLocalStreams().length > 0 ? "YES" : "NO"}
                  </p>
                </>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
  // return (
  //   <div className="grid grid-nogutter">
  //     <div className="col-2">
  //       <div className="host-video-container">
  //         {isHost ? (
  //           <video autoPlay playsInline ref={localVideo} muted style={{
  //             width: "100%",
  //             height: "100%",
  //             objectFit: "cover",
  //             border: "1px solid red",
  //             borderRadius: "5px"
  //         }}/>
  //         ) : (
  //           peerConnections.map((guestPeer, index) => {
  //             if (guestPeer.isHost) {
  //               return (
  //                 <VideoElement
  //                   key={index}
  //                   peer_connection={guestPeer.peer_connection}
  //                 />
  //               );
  //             } else {
  //               return null;
  //             }
  //           })
  //         )}
  //       </div>
  //     </div>
  //     <div className="col-8">
  //       <div className="guest-video-container flex flex-row flex-wrap">

  //         {peerConnections.map((guestPeer, index) => {
  //           if (!guestPeer.isHost && !guestPeer.peer_connection.closed) {
  //             return (
  //               <div>
  //                 <VideoElement
  //                   key={index}
  //                   peer_connection={guestPeer.peer_connection}
  //                 />
  //               </div>
  //             );
  //           }
  //         })}
  //       </div>
  //     </div>
  //     <div className="col-2">
  //       {/* local video for not host */}
  //       {!isHost ? (
  //         <video autoPlay playsInline ref={localVideo} muted style={{
  //           width: "100%",
  //           height: "100%",
  //           objectFit: "cover",
  //           border: "1px solid red",
  //           borderRadius: "5px"
  //       }}/>
  //       ) : (<></>)}
  //     </div>
  //   </div>
  // );
};

export default Room;
