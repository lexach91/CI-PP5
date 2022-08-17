import React, { useEffect, useState, useRef } from "react";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { Navigate } from "react-router-dom";
import { RotateLoader } from "react-spinners";
import { Dropdown } from "primereact/dropdown";
import { ProgressBar } from "primereact/progressbar";
import { Knob } from "primereact/knob";
import axios from "axios";
import { Button } from "primereact/button";


const Settings = () => {
    const { isAuthenticated, user, redirect, loading } = useSelector(
        (state) => state.auth
    );
    const cameraRef = useRef(null);
    const microphoneRef = useRef(null);
    const [cameras, setCameras] = useState([]);
    const [microphones, setMicrophones] = useState([]);
    const [volumeLvl, setVolumeLvl] = useState(0);
    const [currentCamera, setCurrentCamera] = useState(null);
    const [currentMicrophone, setCurrentMicrophone] = useState(null);
    

    let volumeBarDraw;


    const getCameras = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === 'videoinput');
        // convert to dropdown format
        const cameraOptions = cameras.map(camera => ({
            label: camera.label,
            value: camera.deviceId
        }));
        setCameras(cameraOptions);
        // setCameras(cameras);

    };

    const getMicrophones = async () => {
        const devices = await navigator.mediaDevices.enumerateDevices();        
        console.log(devices);
        const microphones = devices.filter(device => device.kind === 'audioinput');
        // convert to dropdown format
        const microphoneOptions = microphones.map(microphone => ({
            label: microphone.label,
            value: microphone.deviceId
        }));
        setMicrophones(microphoneOptions);
        // setMicrophones(microphones);
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

    // const handleCameraChange = (event) => {
    //     setCurrentCamera(event.value);
    //     const camera = event.target.value;
    //     console.log(camera);
    //     // setCurrentCamera(camera.label);
    //     console.log(currentCamera);
    //     // stop stream if it exists
    //     if (cameraRef.current.srcObject) {
    //         cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
    //         cameraRef.current.srcObject = null;
    //     }
    //     navigator.mediaDevices.getUserMedia({video: {deviceId: camera.deviceId }}).then(stream => {
    //         cameraRef.current.srcObject = stream;
    //     }
    //     ).catch(error => {
    //         console.log(error);
    //     }
    //     );
    // };

    const handleCameraChange = (event) => {
        setCurrentCamera(event.value);
        const camera = cameras.find(camera => camera.value === event.value);
        // stop current stream if exists
        if (cameraRef.current.srcObject) {
            cameraRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        // start new stream
        navigator.mediaDevices.getUserMedia({
            audio: false,
            video: {
                deviceId: { exact: camera.value }
            }
        }).then(stream => {
            cameraRef.current.srcObject = stream;
        }
        ).catch(error => {
            console.log(error);
        }
        );
    };



    const handleMicrophoneChange = (event) => {
        setCurrentMicrophone(event.value);
        const microphone = microphones.find(microphone => microphone.value === event.value);
        // stop current stream if exists
        if (microphoneRef.current.srcObject) {
            microphoneRef.current.srcObject.getTracks().forEach(track => track.stop());
        }
        // start new stream
        navigator.mediaDevices.getUserMedia({
            audio: {
                deviceId: { exact: microphone.value }
            },
            video: false
        }).then(stream => {
            microphoneRef.current.srcObject = stream;
            // start listening and changing incoming volume level
            const audioContext = new AudioContext();
            const audioSource = audioContext.createMediaStreamSource(stream);
            const analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;
            analyser.minDecibels = -127;
            analyser.maxDecibels = 0;
            analyser.smoothingTimeConstant = 0.4;
            audioSource.connect(analyser);
            const volumes = new Uint8Array(analyser.frequencyBinCount);
            function listenVolume() {
                volumeBarDraw = requestAnimationFrame(listenVolume);
                analyser.getByteFrequencyData(volumes);
                let volume = volumes.reduce((acc, cur) => acc + cur, 0) / volumes.length;
                // volume should be between 0 and 100, and should be a number (integer)
                volume = Math.round(volume);
                setVolumeLvl(volume);
            }
            listenVolume();
        }
        ).catch(error => {
            console.log(error);
        }
        );
    };

    const saveSettings = async () => {
        const settings = {
            camera_id: currentCamera,
            microphone_id: currentMicrophone,
        };
        const response = await axios.post("devices-settings", settings);
        console.log(response);
    };


    useEffect(() => {
        if(user?.camera_id){
            const camera = cameras.find(camera => camera.value === user.camera_id);
            if (camera) {
                handleCameraChange({value: camera.value});                
            }
            // setCurrentCamera(camera.value);
        }
        if(user?.microphone_id){
            const microphone = microphones.find(microphone => microphone.value === user.microphone_id);
            if (microphone) {
                handleMicrophoneChange({value: microphone.value});
            }
        }
    }, [user, cameras, microphones]);

    // }, [user]);
    
    

    // const handleMicrophoneChange = (event) => {
    //     setCurrentMicrophone(event.value);
    //     const microphone = event.target.value;
    //     console.log(microphone);
    //     // setCurrentMicrophone(microphone.label);
    //     console.log(currentMicrophone);
    //     // stop stream if it exists
    //     // if (microphoneRef.current !== null) {
    //     //     microphoneRef.current.srcObject.getTracks().forEach(track => track.stop());
    //     //     microphoneRef.current.srcObject = null;
    //     // }
    //     navigator.mediaDevices.getUserMedia({audio: {deviceId: microphone.deviceId }}).then(stream => {
    //         microphoneRef.current.srcObject = stream;
    //     }
    //     ).catch(error => {
    //         console.log(error);
    //     }
    //     );
    // };


    // need to demonstrate to the user microphone volume meter as a progress bar, that changes when the user speaks
    
    


 
    
    

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
        <UserLayout title="Settings">
            <div className="grid grid-nogutter mt-4">
                <div className="col-12 text-center">
                    {/* <span>Choose camera:</span> */}
                    <Dropdown
                        value={currentCamera}
                        // optionLabel="label"
                        options={cameras}
                        onChange={handleCameraChange}
                        placeholder="Choose camera"
                        style={{ minWidth: "210px" }}
                    />
                </div>
                <div className="col-12 mt-2">
                    {currentCamera ? (
                        <div style={{ width: "90%", aspectRatio: "16/9", margin:"0 auto"}} className="flex justify-content-center align-items-center surface-50">
                            <video style={{width:"100%", height: "100%", objectFit:"cover", objectPosition:"center"}} autoPlay playsInline muted ref={cameraRef} />
                        </div>
                    ) : (
                        <div style={{ width: "90%", aspectRatio: "16/9", margin:"0 auto"}} className="flex justify-content-center align-items-center surface-50">
                            <div style={{ textAlign: "center"}}>
                                <p>No camera selected</p>
                                <video style={{visibility: "hidden", width:"0px", height: "0px"}} autoPlay playsInline muted ref={cameraRef} />
                            </div>
                        </div>
                    )}
                </div>
                <div className="col-12 mt-3 text-center">
                    {/* <span>Choose microphone:</span> */}
                    <Dropdown
                        value={currentMicrophone}
                        // optionLabel="label"
                        options={microphones}
                        onChange={handleMicrophoneChange}
                        placeholder="Choose microphone"
                        style={{ minWidth: "210px" }}
                    />
                </div>
                <div className="col-12 mt-2 text-center">
                    <audio autoPlay playsInline muted ref={microphoneRef} />
                    {currentMicrophone ? (
                        <Knob value={volumeLvl} readOnly min={0} max={150} />

                    ) : (
                        <div style={{ textAlign: "center"}}>
                            <p>No microphone selected</p>
                            {/* <audio style={{visibility: "hidden", width:"0px", height: "0px"}} autoPlay playsInline muted ref={microphoneRef} /> */}
                        </div>
                    )}

                </div>
                {/* microphone volume meter */}
                {/* <ProgressBar
                    value={volumeLvl}
                    showValue={true}
                    style={{
                        transition: "none",
                        width: "100%",
                        height: "10px",
                    }}
                /> */}
                {/* <div className="volume-bar" style={{width: "300px", height: "10px", backgroundColor: "white"}}>
                    <div className="volume-bar-inner" style={{ width: `${volumeLvl}%` , height: "100%", backgroundColor: "red"}}></div>
                </div> */}
                <Button style={{margin:"0 auto"}} onClick={saveSettings} className="mt-2">Save settings</Button>
            </div>

            </UserLayout>
        );
}

export default Settings;