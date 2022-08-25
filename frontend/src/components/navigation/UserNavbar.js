import React, { useEffect, useRef, useState } from "react";
import { Menubar } from "primereact/menubar";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { logout, resetError, resetMessage } from "../../redux/authSlice";
import { Toast } from "primereact/toast";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";

const UserNavbar = () => {
  const {
    isAuthenticated,
    user,
    error,
    message,
    loading,
    redirect,
    membershipLoading,
    membership,
  } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [sidebarVisible, setSidebarVisible] = useState(false);
  // const toast = useRef(null);

  // useEffect(() => {
  //   if (error) {
  //     if(error.length > 0){
  //       for(let i = 0; i < error.length; i++){
  //         toast.current.show({
  //           severity: 'error',
  //           summary: 'Error',
  //           detail: error[i],
  //           life: 7000
  //         });
  //       }
  //     } else {
  //       toast.current.show({
  //         severity: "error",
  //         summary: "Error",
  //         detail: error,
  //         life: 7000,
  //       });
  //     }
  //     setTimeout(() => {
  //       dispatch(resetError());
  //     }, 7000);
  //   }
  // }, [error]);

  // useEffect(() => {
  //   if (message) {
  //     toast.current.show({
  //       severity: "success",
  //       summary: "Success",
  //       detail: message,
  //       life: 7000,
  //     });
  //     setTimeout(() => {
  //       dispatch(resetMessage());
  //     }, 7000);
  //   }
  // } , [message]);

  const logoutButton = (
    <React.Fragment>
      <div className="p-menuitem">
        <Button
          label="Logout"
          icon="pi pi-power-off"
          className="p-button-danger"
          onClick={async () => {
            await dispatch(logout());
            if (window.location.pathname !== "/") {
              window.location.href = "/";
            }
          }}
        />
      </div>
    </React.Fragment>
  );

  const userAvatar = () => {
    if (user) {
      if (user.avatar) {
        return (
          <Chip
            image={user.avatar}
            label={
              window.innerWidth > 600
                ? user.first_name + " " + user.last_name
                : user.first_name
            }
          />
        );
      } else {
        return (
          <Chip
            label={
              window.innerWidth > 600
                ? user.first_name + " " + user.last_name
                : user.first_name
            }
            icon="pi pi-user"
          />
        );
      }
    }
  };

  const homeButton = (
    <React.Fragment>
      <div className="p-menuitem">
        <Button
          // label="Home"
          icon="pi pi-home"
          tooltip="Home page"
          className="p-button-secondary ml-3 p-button-rounded"
          onClick={() => {
            window.location.href = "/";
          }}
        />
      </div>
    </React.Fragment>
  );

  const userButton = (
    <React.Fragment>
      <div
        className="p-menuitem"
        onClick={() => {
          setSidebarVisible(true);
        }}
        style={{ cursor: "pointer", userSelect: "none" }}>
        {userAvatar()}
      </div>
        {window.location.pathname !== "/" ? homeButton : null}
    </React.Fragment>
  );
  return (isAuthenticated && user) && (
    <header className="navbar">
      {/* <Toast ref={toast} style={{ zIndex: "10000" }} /> */}
      <nav className="navbar-nav">
        <Toolbar left={userButton} right={logoutButton} />
      </nav>
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        // style={{ width: "fit-content" }}
        >
        <div className="grid">
          <div className="col-12">
            <Card
              // style={{wordBreak:"break-all"}}
              >
              <div className="flex">
                <div className="flex justify-content-center align-items-center">
                  <Avatar
                    size="xlarge"
                    image={
                      user.avatar
                        ? user.avatar
                        : "https://res.cloudinary.com/lexach91/image/upload/v1653724113/lklqlcqgl2pklvdi9rbt.svg"
                    }
                  />
                </div>
                <Divider layout="vertical" />
                <div>
                  <h5>{user.first_name + " " + user.last_name}</h5>
                  <p>{user.email}</p>
                </div>
              </div>
            </Card>
          </div>
          <div className="col-12">
            <Button
              label="Home"
              icon="pi pi-home"
              className="p-button-secondary mb-2 w-full"
              onClick={() => {
                window.location.href = "/";
              }}
            />
          </div>
          <div className="col-12">
            <Button
              label="Profile"
              icon="pi pi-user"
              className="p-button-secondary mb-2 w-full"
              onClick={() => {
                window.location.href = "/profile";
              }}
            />
          </div>
          <div className="col-12">
            <Button
              label="Settings"
              icon="pi pi-cog"
              className="p-button-secondary mb-2 w-full"
              onClick={() => {
                window.location.href = "/settings";
              }}
            />
          </div>
          {!membershipLoading && membership && membership.can_create_rooms && (
            <div className="col-12">
              <Button
                label="Create Room"
                icon="pi pi-plus"
                className="p-button-secondary mb-2 w-full"
                onClick={() => {
                  window.location.href = "/create-room";
                }}
              />
            </div>
          )}
        </div>
      </Sidebar>
    </header>
  );
};

export default UserNavbar;
