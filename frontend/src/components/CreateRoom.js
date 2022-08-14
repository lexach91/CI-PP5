import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import RotateLoader from "react-spinners/RotateLoader";
import UserLayout from "../layouts/UserLayout";
import { Button } from "primereact/button";
// import { Checkbox } from "primereact/checkbox";
import { InputSwitch } from "primereact/inputswitch";
import { Password } from "primereact/password";
import { Messages } from "primereact/messages";
import { Navigate } from "react-router-dom";
import { RadioButton } from "primereact/radiobutton";

const CreateRoom = () => {
  const { loading, redirect, isAuthenticated, membership, membershipLoading } =
    useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [roomProtected, setRoomProtected] = useState(false);
  const [roomPassword, setRoomPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [chatEnabled, setChatEnabled] = useState(false);
  const [guestControlEnabled, setGuestControlEnabled] = useState(false);
  const [created, setCreated] = useState(false);
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const messageRef = useRef();
  const [maxGuests, setMaxGuests] = useState(3);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    // if (isAuthenticated) {
    //   return <Navigate to="/" />;
    // }
  }, [redirect]);

  useEffect(() => {
    if (membershipLoading) {
      return;
    }
    if (!membership) {
      return;
    }
    if (!membership.can_create_rooms) {
      console.log("cannot create room");
      console.log(membership);
      setError("You do not have permission to create a room.");
      messageRef.current.show({
        severity: "error",
        detail: "You do not have permission to create a room.",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    }
  }, [membershipLoading, membership]);

  const onSubmit = async () => {
    setSubmitting(true);
    let payload = {
      protected: roomProtected,
      chat_enabled: chatEnabled,
      guests_input_control: guestControlEnabled,
      max_guests: maxGuests,
    };
    if (roomProtected) {
      payload["password"] = roomPassword;
    }
    await axios
      .post("rooms/create", payload)
      .then((res) => {
        setToken(res.data.token);
        setSubmitting(false);
        setCreated(true);
      })
      .catch((err) => {
        console.log(err);
        onError(err);
      });
    // if (response.status === 200) {
    //     setSubmitting(false);
    //     setCreated(true);
    //     setToken(response.data.token);
    // } else {
    //     onError(response);
    // }

    // setSubmitting(false);
  };

  const onError = (error) => {
    setSubmitting(false);
    if (error.response.data.error) {
      console.log("i failed in if");
      setError(error.response.data.error);
      messageRef.current.show({
        severity: "error",
        summary: "Error",
        detail: error.response.data.error,
      });
    } else {
      for (let key in error.response.data) {
        console.log("i failed in else");
        setError(`${error.response.data[key]} - ${key}`);
        messageRef.current.show({
          severity: "error",
          detail: `${key}: ${error.response.data[key]}`,
        });
      }
    }
  };

  if (created) {
    return <Navigate to={`/room/${token}`} />;
  }

  return loading || !isAuthenticated ? (
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
      <Messages ref={messageRef} />
    </div>
  ) : (
    <UserLayout title="Create Room">
      <Messages ref={messageRef} />
      <div className="form-room pt-5">
        <div className="flex justify-content-center h-full">
          <div className="surface-card p-4 border-round w-full lg:w-6">
            <h5 className="text-center">Create Room</h5>
            <div className="flex justify-content-between align-items-center m-2">
              <p>Protect with password</p>
              <InputSwitch
                checked={roomProtected}
                onChange={(e) => setRoomProtected(e.value)}
              />
            </div>
            <div
              className={`${
                roomProtected ? "flex" : "hidden"
              } justify-content-between align-items-center m-2`}>
              <p>Password</p>
              <Password
                value={roomPassword}
                onChange={(e) => setRoomPassword(e.target.value)}
                disabled={!roomProtected}
              />
            </div>
            <div className="flex justify-content-between align-items-center m-2">
              <p>Chat Enabled</p>
              <InputSwitch
                checked={chatEnabled}
                onChange={(e) => setChatEnabled(e.value)}
              />
            </div>
            <div className="flex justify-content-between align-items-center m-2">
              <p>Guest Input Controls Enabled</p>
              <InputSwitch
                checked={guestControlEnabled}
                onChange={(e) => setGuestControlEnabled(e.value)}
              />
            </div>
            <div className="flex justify-content-between align-items-center m-2">
              <p>Max Guests</p>
              <div>
                <RadioButton
                  className="mr-1"
                  tooltip="Host + 3 guests"
                  inputId="maxGuests3"
                  name="max_guests"
                  value={3}
                  onChange={(e) => setMaxGuests(e.value)}
                  checked={maxGuests === 3}
                />
                <label htmlFor="maxGuests3">3</label>
              </div>
              <div>
                <RadioButton
                  className="mr-1"
                  tooltip={membership?.guest_limit < 8 ? "Your membership does not allow you to use this layout" : "Host + 8 guests"}
                  name="max_guests"
                  value={8}
                  onChange={(e) => setMaxGuests(e.value)}
                  checked={maxGuests === 8}
                  disabled={membership?.guest_limit < 8}
                />
                <label htmlFor="maxGuests8">8</label>
              </div>
              <div>
                <RadioButton
                  className="mr-1"
                  tooltip={membership?.guest_limit < 11 ? "Your membership does not allow you to use this layout" : "Host + 11 guests"}
                  name="max_guests"
                  value={11}
                  onChange={(e) => setMaxGuests(e.value)}
                  checked={maxGuests === 11}
                  disabled={membership?.guest_limit < 11}
                />
                <label htmlFor="maxGuests11">11</label>
              </div>
            </div>
            <div className="flex justify-content-center align-items-center m-2">
              <Button
                label="Create"
                icon="pi pi-check"
                onClick={onSubmit}
                loading={submitting}
                loadingIcon="pi pi-spinner pi-spin"
                className="w-full"
                disabled={!membership?.can_create_rooms || submitting}
              />
            </div>
          </div>
        </div>
      </div>
    </UserLayout>
  );
};

export default CreateRoom;
