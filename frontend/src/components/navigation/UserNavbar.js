import React, { useState } from "react";
import { Sidebar } from "primereact/sidebar";
import { Button } from "primereact/button";
import { Chip } from "primereact/chip";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import { logout } from "../../redux/authSlice";
import { Card } from "primereact/card";
import { Avatar } from "primereact/avatar";
import { Divider } from "primereact/divider";
import { Toolbar } from "primereact/toolbar";
import { useNavigate } from "react-router-dom";

const UserNavbar = () => {
  const {
    isAuthenticated,
    user,
    membershipLoading,
    membership,
  } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [sidebarVisible, setSidebarVisible] = useState(false);
 

  const logoutButton = (
    <React.Fragment>
      <div className="p-menuitem">
        <Button
          label="Logout"
          icon="pi pi-power-off"
          className="p-button-danger"
          onClick={async () => {
            await dispatch(logout());
            navigate("/");
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
          icon="pi pi-home"
          tooltip="Home page"
          className="p-button-secondary ml-3 p-button-rounded"
          onClick={() => {
            navigate("/");
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
      <nav className="navbar-nav">
        <Toolbar left={userButton} right={logoutButton} />
      </nav>
      <Sidebar
        visible={sidebarVisible}
        onHide={() => setSidebarVisible(false)}
        >
        <div className="grid">
          <div className="col-12">
            <Card
              style={{wordBreak:"break-all"}}
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
                navigate("/");
              }}
            />
          </div>
          <div className="col-12">
            <Button
              label="Profile"
              icon="pi pi-user"
              className="p-button-secondary mb-2 w-full"
              onClick={() => {
                navigate("/profile");
              }}
            />
          </div>
          <div className="col-12">
            <Button
              label="Settings"
              icon="pi pi-cog"
              className="p-button-secondary mb-2 w-full"
              onClick={() => {
                navigate("/settings");
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
                  navigate("/create-room");
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
