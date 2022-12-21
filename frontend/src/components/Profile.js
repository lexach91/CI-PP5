import React, { useEffect, useState, useRef } from "react";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect, setError, setUser } from "../redux/authSlice";
import { RotateLoader } from "react-spinners";
import { CountryService } from "../service/CountryService";
import { Image } from "primereact/image";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import axios from "axios";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { Password } from "primereact/password";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { isAuthenticated, user, redirect, loading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [countriesList, setCountriesList] = useState([]);
  const countryservice = new CountryService();
  const [editMode, setEditMode] = useState(false);
  const [editAvatar, setEditAvatar] = useState(false);
  const [editFirstName, setEditFirstName] = useState(false);
  const [editLastName, setEditLastName] = useState(false);
  const [editBirthDate, setEditBirthDate] = useState(false);
  const [editCountry, setEditCountry] = useState(false);
  const toast = useRef(null);
  const [avatarFile, setAvatarFile] = useState(null);
  const [formUploading, setFormUploading] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [passwordUpdating, setPasswordUpdating] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [restricted, setRestricted] = useState(false);

  useEffect(() => {
    if (isAuthenticated === false && loading === false) {
      dispatch(setError("You must be logged in to access this page."));
      setRestricted(true);
    }
  }, [isAuthenticated, loading]);

  if (restricted) {
    dispatch(setError("You must be logged in to access this page."));
    navigate("/");
  }

  useEffect(() => {
    countryservice.getCountries().then((data) => {
      setCountriesList(data);
    });
  }, []);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      setAvatar(
        user.avatar ||
          "https://res.cloudinary.com/lexach91/image/upload/v1653724113/lklqlcqgl2pklvdi9rbt.svg"
      );
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setEmail(user.email);
      setBirthDate(user.birth_date);
      setCountry(user.country);
    } else {
      setAvatar("");
      setFirstName("");
      setLastName("");
      setEmail("");
      setBirthDate("");
      setCountry("");
    }
  }, [isAuthenticated, user, redirect]);

  const onSubmit = async (data) => {
    setFormUploading(true);
    const formData = avatarFile || new FormData();
    formData.append("first_name", firstName);
    formData.append("last_name", lastName);
    formData.append("birth_date", birthDate);
    formData.append("country", country);

    await axios
      .post("edit-profile", formData)
      .then((data) => {
        toast.current.show({
          severity: "success",
          detail: "Profile updated successfully",
        });
        let user = data.data.user;
        dispatch(setUser(user));
        setFormUploading(false);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          detail: "Error updating profile",
        });
        setFormUploading(false);
      });
  };

  const onChangeAvatar = (e) => {
    setAvatar(e.files[0].objectURL);
    const formData = new FormData();
    formData.append("avatar", e.files[0]);
    setAvatarFile(formData);
    setEditAvatar(false);
  };

  const onChangeFirstName = (e) => {
    setFirstName(e.target.value);
  };

  const onChangeLastName = (e) => {
    setLastName(e.target.value);
  };

  const onChangeEmail = (e) => {
    setEmail(e.target.value);
  };

  const onChangeBirthDate = (e) => {
    let date = e.value.toLocaleDateString();
    date = date.split("/").reverse().join("-");
    setBirthDate(date);
    setEditBirthDate(false);
  };

  const onChangeCountry = (e) => {
    setCountry(e.target.value);
    setEditCountry(false);
  };

  const changesMade = () => {
    if (
      avatar !== user.avatar ||
      firstName !== user.first_name ||
      lastName !== user.last_name ||
      birthDate !== user.birth_date ||
      country !== user.country
    ) {
      return true;
    } else {
      return false;
    }
  };

  const changePassword = async () => {
    setPasswordUpdating(true);
    const payload = {
      old_password: oldPassword,
      new_password: newPassword,
      confirm_password: confirmPassword,
    };
    await axios
      .post("change-password", payload)
      .then((data) => {
        toast.current.show({
          severity: "success",
          detail: "Password changed successfully",
        });
        setPasswordUpdating(false);
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setDialogVisible(false);
      })
      .catch((error) => {
        toast.current.show({
          severity: "error",
          detail: error.response.data.error,
        });
        setPasswordUpdating(false);
      });
  };

  const onChangeOldPassword = (e) => {
    setOldPassword(e.target.value);
  };

  const onChangeNewPassword = (e) => {
    setNewPassword(e.target.value);
  };

  const onChangeConfirmPassword = (e) => {
    setConfirmPassword(e.target.value);
  };

  const passwordDialog = () => {
    return (
      <Dialog
        header="Change Password"
        visible={dialogVisible}
        style={{ width: "50vw" }}
        footer={
          <div>
            <Button
              label="Cancel"
              onClick={() => {
                setDialogVisible(false);
                setOldPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
            />
            <Button
              label="Submit"
              disabled={
                oldPassword.length === 0 ||
                newPassword.length === 0 ||
                confirmPassword.length === 0 ||
                newPassword !== confirmPassword
              }
              onClick={() => {
                changePassword();
              }}
            />
          </div>
        }>
        <div className="form-group">
          <label htmlFor="oldPassword">Old Password</label>
          <Password
            id="oldPassword"
            value={oldPassword}
            onChange={onChangeOldPassword}
            placeholder="Old Password"
            feedback={false}
            toggleMask={true}
          />
        </div>
        <div className="form-group">
          <label htmlFor="newPassword">New Password</label>
          <Password
            id="newPassword"
            value={newPassword}
            onChange={onChangeNewPassword}
            placeholder="New Password"
            toggleMask={true}
          />
        </div>
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password</label>
          <Password
            id="confirmPassword"
            value={confirmPassword}
            onChange={onChangeConfirmPassword}
            placeholder="Confirm Password"
            feedback={false}
            toggleMask={true}
          />
        </div>
      </Dialog>
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
  ) : isAuthenticated && user ? (
    <UserLayout title="Profile">
      <Toast ref={toast} />
      <div className="surface-0 p-4 w-full md:w-8 md:mx-auto">
        <div className="font-medium text-3xl text-900 mb-3">My profile</div>
        <div className="text-500 mb-5">
          Here you can edit your profile and change your avatar.
        </div>
        <ul className="list-none p-0 m-0">
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Avatar</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              {editAvatar ? (
                <FileUpload
                  name="avatar"
                  accept="image/*"
                  mode="basic"
                  onSelect={onChangeAvatar}
                  customUpload={true}
                />
              ) : (
                <Image
                  src={avatar}
                  preview={true}
                  imageStyle={{
                    height: "150px",
                    width: "150px",
                    objectFit: "cover",
                    objectPosition: "center",
                  }}
                />
              )}
            </div>
            <div className="w-6 md:w-2 flex justify-content-end">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => setEditAvatar(!editAvatar)}
              />
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">First Name</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              {editFirstName ? (
                <InputText
                  name="first_name"
                  value={firstName}
                  onChange={onChangeFirstName}
                  onBlur={() => setEditFirstName(!editFirstName)}
                />
              ) : (
                <div className="text-900">{firstName}</div>
              )}
            </div>
            <div className="w-6 md:w-2 flex justify-content-end">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => setEditFirstName(!editFirstName)}
              />
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Last Name</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              {editLastName ? (
                <InputText
                  name="last_name"
                  value={lastName}
                  onChange={onChangeLastName}
                  onBlur={() => setEditLastName(!editLastName)}
                />
              ) : (
                <div className="text-900">{lastName}</div>
              )}
            </div>
            <div className="w-6 md:w-2 flex justify-content-end">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => setEditLastName(!editLastName)}
              />
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Email</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1">
              <div className="text-900">{email}</div>
            </div>
            <div className="w-6 md:w-2 flex justify-content-end">
              <Button
                label="Can't change"
                icon="pi pi-times"
                className="p-button-text"
                disabled={true}
              />
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Birth Date</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 line-height-3">
              {editBirthDate ? (
                <Calendar
                  name="birth_date"
                  dateFormat="yy-mm-dd"
                  mask="9999-99-99"
                  showIcon
                  value={new Date(birthDate)}
                  onChange={onChangeBirthDate}
                />
              ) : (
                <div className="text-900">{birthDate}</div>
              )}
            </div>
            <div className="w-6 md:w-2 flex justify-content-end">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => setEditBirthDate(!editBirthDate)}
              />
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Country</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 line-height-3">
              {editCountry ? (
                <Dropdown
                  name="country"
                  value={country}
                  options={countriesList}
                  onChange={onChangeCountry}
                />
              ) : (
                <div className="text-900">{country}</div>
              )}
            </div>
            <div className="w-6 md:w-2 flex justify-content-end">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => setEditCountry(!editCountry)}
              />
            </div>
          </li>
          <li className="flex align-items-center py-3 px-2 border-top-1 border-bottom-1 border-300 flex-wrap">
            <div className="text-500 w-6 md:w-2 font-medium">Password</div>
            <div className="text-900 w-full md:w-8 md:flex-order-0 flex-order-1 line-height-3">
              <div className="text-900">*********</div>
              {passwordDialog()}
            </div>
            <div className="w-6 md:w-2 flex justify-content-end">
              <Button
                label="Edit"
                icon="pi pi-pencil"
                className="p-button-text"
                onClick={() => setDialogVisible(true)}
              />
            </div>
          </li>
        </ul>
        <div className="flex justify-content-center mt-3">
          <Button
            label="Save"
            icon="pi pi-check"
            className="p-button-primary"
            onClick={onSubmit}
            loading={formUploading}
            disabled={!changesMade()}
          />
        </div>
      </div>
    </UserLayout>
  ) : (
    <> </>
  );
};

export default Profile;
