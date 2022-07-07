import React, { useEffect, useState, useRef } from "react";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { Navigate } from "react-router-dom";
import { RotateLoader } from "react-spinners";
import { Dropdown } from "primereact/dropdown";
import { ProgressBar } from "primereact/progressbar";


const Settings = () => {
    const { isAuthenticated, user, redirect, loading } = useSelector(
        (state) => state.auth
    );
    const cameraRef = useRef(null);
    const microphoneRef = useRef(null);
    const [cameras, setCameras] = useState([]);
    const [microphones, setMicrophones] = useState([]);
    const [volumeLvl, setVolumeLvl] = useState(0);
    


    const getCameras = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        setCameras(cameras);

    };

    const getMicrophones = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();        
        console.log(devices);
        const microphones = devices.filter(device => device.kind === 'audioinput');
        setMicrophones(microphones);
    };

    const usersPermission = async () => {
        const permission = await navigator.mediaDevices.getUserMedia(
            {audio: true, video: true},
            (stream) => {
                console.log(stream);
                // set default camera and microphone
                cameraRef.current.srcObject = stream;
                microphoneRef.current.srcObject = stream;
            },
            (error) => {
                console.log(error);
            }
        );
        console.log(permission);
        getCameras();
        getMicrophones();
        // stop stream
        permission.getTracks().forEach(track => track.stop());
    };


    const dispatch = useDispatch();

    useEffect(() => {
        if (redirect) {
            dispatch(resetRedirect());
        }
    }, [redirect, dispatch]);

    useEffect(() => {
        // if (isAuthenticated && user) {
            usersPermission();            
        // }
    }, []);

    const handleCameraChange = (event) => {
        const camera = event.target.value;
        console.log(camera);
        // stop stream if it exists
        if (cameraRef.current.srcObject) {
            cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
            cameraRef.current.srcObject = null;
        }
        navigator.mediaDevices.getUserMedia({video: {deviceId: camera.deviceId }}).then(stream => {
            cameraRef.current.srcObject = stream;
        }
        ).catch(error => {
            console.log(error);
        }
        );
    };

    

    const handleMicrophoneChange = (event) => {
        const microphone = event.target.value;
        console.log(microphone);
        // stop stream if it exists
        // if (microphoneRef.current !== null) {
        //     microphoneRef.current.srcObject.getTracks().forEach(track => track.stop());
        //     microphoneRef.current.srcObject = null;
        // }
        navigator.mediaDevices.getUserMedia({audio: {deviceId: microphone.deviceId }}).then(stream => {
            microphoneRef.current.srcObject = stream;
        }
        ).catch(error => {
            console.log(error);
        }
        );
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
      ) : (
        <UserLayout>
            <div className="settings">
                <span>Choose camera:</span>
                <Dropdown
                    options={cameras}
                    onChange={(e) => {
                        handleCameraChange(e);
                    }
                    }
                />
                <span>Choose microphone:</span>
                <Dropdown
                    options={microphones}
                    onChange={(e) => {
                        handleMicrophoneChange(e);
                    }
                    }
                />
                </div>
                <video autoPlay playsInline muted ref={cameraRef} />
                {/* microphone volume meter */}
                <audio autoPlay playsInline muted ref={microphoneRef} />
                <ProgressBar
                    value={volumeLvl}
                    showValue={true}
                />
                

            </UserLayout>
        );
}

export default Settings;