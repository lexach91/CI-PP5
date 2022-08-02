import {useRef, useEffect} from "react";


const VideoElement = (props) => {
    const videoRef = useRef(null);
    const { peer_connection} = props;
    useEffect(() => {
        if (peer_connection) {
            peer_connection.ontrack = (event) => {
                console.log("ontrack");
                console.log(event);
                videoRef.current.srcObject = event.streams[0];
            }
        }
    }, [peer_connection]);

    return (
        <video 
            ref={videoRef}
            autoPlay
            playsInline
            muted
        />
    );
};

export default VideoElement;