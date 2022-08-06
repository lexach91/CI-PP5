import { useRef, useEffect } from "react";

const VideoElement = (props) => {
  const videoRef = useRef(null);
  const { peerConnection } = props;

  

  useEffect(() => {
    if (peerConnection._remoteStreams[0]) {
      videoRef.current.srcObject = peerConnection._remoteStreams[0];
    } else {
      peerConnection.on("stream", (stream) => {
        videoRef.current.srcObject = stream;        
      });
    }
  }, [peerConnection]);

  return (
      <video
        ref={videoRef}
        autoPlay
        playsInline
        // muted
        className="video-element"
      />        
  );
};

export default VideoElement;
