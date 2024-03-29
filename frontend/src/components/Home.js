import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { VisitorLayout } from "../layouts/VisitorLayout";
import { UserLayout } from "../layouts/UserLayout";
import { Button } from "primereact/button";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { Tooltip } from "primereact/tooltip";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const {
    isAuthenticated,
    user,
    redirect,
    loading,
    membershipLoading,
    membership,
  } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [dialogVisible, setDialogVisible] = useState(false);
  const [roomToken, setRoomToken] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cameraName, setCameraName] = useState("");
  const [microphoneName, setMicrophoneName] = useState("");
  const [readyToJoin, setReadyToJoin] = useState(false);
  const [roomProtected, setRoomProtected] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [checkingRoom, setCheckingRoom] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
  }, [redirect]);

  const getCameraName = async () => {
    let cameraId = user?.camera_id;
    if (cameraId) {
      let devices = await navigator.mediaDevices.enumerateDevices();
      let camera = devices.find((device) => device.deviceId === cameraId);
      if (camera) {
        setCameraName(camera.label);
      }
    } else {
      setCameraName("Not set");
    }
  };

  const getMicrophoneName = async () => {
    let microphoneId = user?.microphone_id;
    if (microphoneId) {
      let devices = await navigator.mediaDevices.enumerateDevices();
      let microphone = devices.find(
        (device) => device.deviceId === microphoneId
      );
      if (microphone) {
        setMicrophoneName(microphone.label);
      }
    } else {
      setMicrophoneName("Not set");
    }
  };

  useEffect(() => {
    if (user) {
      getCameraName();
      getMicrophoneName();
    }
  }, [user]);

  const userDashboard = () => {
    if (!membershipLoading && membership && user) {
      return (
        <div className="card grid" style={{ width: "100%", padding: "1rem" }}>
          <div className="grid col-12 col-offset-0 md:col-8 md:col-offset-2">
            <h2 className="text-center col-12">
              Welcome, {`${user.first_name} ${user.last_name}`}
            </h2>
            <div className="col-12 xl:col-6">
              <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round h-full">
                <div className="flex justify-content-between mb-3">
                  <div style={{ wordBreak: "break-all" }}>
                    <span className="block text-green-500 font-medium mb-3">
                      Profile
                    </span>
                    <div className="block font-medium text-xl">
                      <p className="text-500">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-500">{user.email}</p>
                    </div>
                  </div>
                  <div
                    className="flex flex-shrink-0 align-items-center justify-content-center bg-blue-100 border-round"
                    style={{ width: "2.5rem", height: "2.5rem" }}>
                    <i className="pi pi-user text-blue-500 text-xl"></i>
                  </div>
                </div>
                <Button
                  label="Profile page"
                  icon="pi pi-user"
                  className="p-button-success w-full"
                  onClick={() => {
                    navigate("/profile");
                  }}
                />
              </div>
            </div>
            <div className="col-12 xl:col-6">
              <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round h-full">
                <div className="flex justify-content-between mb-3">
                  <div style={{ wordBreak: "break-all" }}>
                    <span className="block text-green-500 font-medium mb-3">
                      Membership plan
                    </span>
                    <div className="block font-medium text-xl">
                      <p className="text-500">{membership.name}</p>
                      <p className="text-500">
                        You can{" "}
                        {membership.can_create_rooms
                          ? "join and create"
                          : "only join"}{" "}
                        rooms
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex flex-shrink-0 align-items-center justify-content-center bg-orange-100 border-round"
                    style={{ width: "2.5rem", height: "2.5rem" }}>
                    <i className="pi pi-dollar text-orange-500 text-xl"></i>
                  </div>
                </div>
                {membership.can_create_rooms ? (
                  <Button
                    label="See subscription"
                    icon="pi pi-dollar"
                    className="p-button-success w-full"
                    onClick={() => {
                      navigate("/subscription");
                    }}
                  />
                ) : (
                  <Button
                    label="See pricing"
                    icon="pi pi-dollar"
                    className="p-button-success w-full"
                    onClick={() => {
                      navigate("/pricing");
                    }}
                  />
                )}
              </div>
            </div>
            <div className="col-12 xl:col-6">
              <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round h-full">
                <div className="flex justify-content-between mb-3">
                  <div style={{ wordBreak: "break-all" }}>
                    <span className="block text-green-500 font-medium mb-3">
                      Settings
                    </span>
                    <div className="block font-medium text-xl">
                      <p className="text-500">
                        Current camera:
                        <Tooltip target=".pi-video" showDelay={100} />
                        <i
                          className="pi pi-video text-green-500 text-xl"
                          data-pr-tooltip={cameraName}></i>
                      </p>
                      <p className="text-500">
                        Current microphone:
                        <Tooltip target=".pi-volume-up" showDelay={100} />
                        <i
                          className="pi pi-volume-up text-green-500 text-xl"
                          data-pr-tooltip={microphoneName}></i>
                      </p>
                    </div>
                  </div>
                  <div
                    className="flex flex-shrink-0 align-items-center justify-content-center bg-cyan-100 border-round"
                    style={{ width: "2.5rem", height: "2.5rem" }}>
                    <i className="pi pi-cog text-cyan-500 text-xl"></i>
                  </div>
                </div>
                <Button
                  label="Settings"
                  icon="pi pi-cog"
                  className="p-button-success w-full"
                  onClick={() => {
                    navigate("/settings");
                  }}
                />
              </div>
            </div>
            <div className="col-12 xl:col-6">
              <div className="surface-0 shadow-2 p-3 border-1 border-50 border-round h-full">
                <div className="flex justify-content-between mb-3">
                  <div style={{ wordBreak: "break-all" }}>
                    <span className="block text-green-500 font-medium mb-3">
                      Meetings
                    </span>
                    <div className="block font-medium text-xl">
                      <p className="text-500">Start or join a meeting</p>
                      <p className="text-500">Use the buttons bellow</p>
                    </div>
                  </div>
                  <div
                    className="flex flex-shrink-0 align-items-center justify-content-center bg-purple-100 border-round"
                    style={{ width: "2.5rem", height: "2.5rem" }}>
                    <i className="pi pi-video text-purple-500 text-xl"></i>
                  </div>
                </div>
                <span className="p-buttonset w-full">
                  <Button
                    label="Create meeting"
                    icon="pi pi-plus"
                    className="p-button-success w-6"
                    disabled={!membership.can_create_rooms}
                    onClick={() => {
                      navigate("/create-room");
                    }}
                  />
                  <Button
                    label="Join meeting"
                    icon="pi pi-link"
                    className="p-button-success w-6"
                    onClick={() => {
                      setDialogVisible(true);
                    }}
                  />
                </span>
                {dialog()}
              </div>
            </div>
          </div>
        </div>
      );
    }
  };

  const dialogFooter = () => {
    return (
      <div className="flex justify-content-center">
        <Button
          label="Cancel"
          icon="pi pi-times"
          className="p-button-secondary w-6 m-2"
          onClick={() => {
            setDialogVisible(false);
            setErrorMessage("");
            setRoomToken("");
          }}
        />
        <Button
          label="Join"
          icon="pi pi-login"
          className="p-button-success w-6 m-2"
          disabled={!readyToJoin}
          onClick={() => {
            if (roomToken && roomToken.length === 32) {
              setDialogVisible(false);
              if (roomPassword) {
                navigate(
                  "/join-room/" + roomToken + `?password=${roomPassword}`
                );
              } else {
                navigate("/join-room/" + roomToken);
              }
            } else if (!roomToken) {
              setErrorMessage("Room token is required");
            } else if (roomToken.length !== 32) {
              setErrorMessage("Room token should be 32 characters long");
            } else {
              setErrorMessage("Something went wrong");
            }
            setTimeout(() => {
              setErrorMessage("");
            }, 3000);
          }}
        />
      </div>
    );
  };

  const dialog = () => {
    return (
      <Dialog
        header="Join meeting"
        visible={dialogVisible}
        className="w-full md:w-6"
        footer={dialogFooter()}
        onHide={() => {
          setDialogVisible(false);
          setRoomToken("");
          setErrorMessage("");
        }}>
        <div className="flex flex-column">
          <InputText
            placeholder="Room token"
            value={roomToken}
            className={errorMessage ? "p-invalid w-full" : "w-full"}
            loading={checkingRoom}
            onChange={(e) => {
              setRoomToken(e.target.value);
            }}
          />
          <div className="text-red-500 text-left w-full mt-2">
            {errorMessage}
          </div>
          {roomProtected && (
            <div className="flex flex-column">
              <Password
                placeholder="Room password"
                value={roomPassword}
                className="w-full"
                inputClassName="w-full"
                toggleMask
                feedback={false}
                onChange={(e) => {
                  setRoomPassword(e.target.value);
                }}
              />
              <div className="text-red-500 text-left w-full mt-2">
                This room is protected. Enter the password
              </div>
            </div>
          )}
        </div>
      </Dialog>
    );
  };

  const checkRoom = async (token) => {
    try {
      const response = await axios.get(
        `rooms/is-protected?room_token=${token}`
      );
      if (response.data.protected) {
        setRoomProtected(true);
      } else {
        setRoomProtected(false);
        setReadyToJoin(true);
      }
      setCheckingRoom(false);
    } catch (error) {
      setCheckingRoom(false);
      setErrorMessage("Something went wrong");
      setTimeout(() => {
        setErrorMessage("");
      }, 3000);
    }
  };

  useEffect(() => {
    if (roomToken && roomToken.length === 32) {
      setCheckingRoom(true);
      checkRoom(roomToken);
    }
  }, [roomToken]);

  useEffect(() => {
    if (roomPassword && roomPassword.length > 0) {
      setReadyToJoin(true);
    }
  }, [roomPassword]);

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
  ) : isAuthenticated ? (
    <UserLayout title="Home">{userDashboard()}</UserLayout>
  ) : (
    <VisitorLayout title="Home">
      <div className="grid grid-nogutter surface-50 text-800 md:h-30rem">
        <div className="col-12 md:col-6 p-6 text-center md:text-left flex align-items-center ">
          <section className="my-0 mx-auto md:mx-0">
            <span className="block text-5xl font-bold mb-1">
              <span className="text-gray-500">Dr</span>
              <span className="text-indigo-200">.</span>
              <span className="text-green-600">Meetings</span> - is an
              absolutely new level of
            </span>
            <div className="text-5xl text-primary font-bold mb-3">
              cloud meetings
            </div>
            <p className="mt-0 mb-4 text-700 line-height-3">
              Our platform is the best way to manage your meetings and video
              calls.
            </p>

            <Button
              label="Learn More"
              type="button"
              className="mr-3 p-button-raised"
              onClick={() => {
                const element = document.getElementById("features");
                element.scrollIntoView({ behavior: "smooth" });
              }}
            />
            <Button
              label="Get Started"
              type="button"
              className="p-button-outlined"
              onClick={() => {
                navigate("/register");
              }}
            />
          </section>
        </div>
        <div className="col-12 md:col-6 overflow-hidden h-full md:block hidden">
          <img
            src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-1.2.1&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80"
            alt="hero-1"
            className="md:ml-auto md:block md:h-full hidden"
            style={{ clipPath: "polygon(8% 0, 100% 0%, 100% 100%, 0 100%)" }}
          />
        </div>
      </div>
      <Divider />
      <div className="surface-0 text-center mt-8 p-5" id="features">
        <div className="mb-3 font-bold text-2xl">
          <span className="text-900">One Product, </span>
          <span className="text-blue-600">Many Solutions</span>
        </div>
        <div className="text-700 text-sm mb-6">
          Find out why our platform is the best place for virtual meetings
        </div>
        <div className="grid grid-nogutter">
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-desktop text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">Built for Everyone</div>
            <span className="text-700 text-sm line-height-3">
              It doesn't matter what you do, we have a solution for you.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-lock text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">
              End-to-End Encryption
            </div>
            <span className="text-700 text-sm line-height-3">
              We assume that our customers are secure.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-check-circle text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">Easy to Use</div>
            <span className="text-700 text-sm line-height-3">
              We have a simple and easy to use interface.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-globe text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">
              Fast & Global Support
            </div>
            <span className="text-700 text-sm line-height-3">
              Let's imagine that we are the real business and we are there for
              you 24/7.
            </span>
          </div>
          <div className="col-12 md:col-4 mb-4 px-5">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-github text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">Open Source</div>
            <span className="text-700 text-sm line-height-3">
              You can see every single line of code that we use.
            </span>
          </div>
          <div className="col-12 md:col-4 md:mb-4 mb-0 px-3">
            <span
              className="p-3 shadow-2 mb-3 inline-block"
              style={{ borderRadius: "10px" }}>
              <i className="pi pi-shield text-4xl text-blue-500"></i>
            </span>
            <div className="text-900 mb-3 font-medium">Trusted Security</div>
            <span className="text-700 text-sm line-height-3">
              We have a strong security team that is always ready to help you.
            </span>
          </div>
        </div>
      </div>
      <Divider />
      <div className="surface-0 text-700 text-center mt-8 mb-8 p-8">
        <div className="text-900 font-bold text-5xl mb-3">
          Ready to Get Started?
        </div>
        <div className="text-700 text-2xl mb-5">
          See our pricing and choose the best plan for you.
        </div>
        <Button
          label="See Pricing"
          icon="pi pi-arrow-right"
          className="font-bold px-5 py-3 p-button-raised p-button-rounded white-space-nowrap"
          onClick={() => {
            navigate("/pricing");
          }}
        />
      </div>
    </VisitorLayout>
  );
};

export default Home;
