import React, { useEffect, useState } from "react";
import UserLayout from "../layouts/UserLayout";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect } from "../redux/authSlice";
import { Navigate } from "react-router-dom";
import { RotateLoader } from "react-spinners";
import { CountryService } from "../service/CountryService";
import { Image } from "primereact/image";
import { Inplace, InplaceContent, InplaceDisplay } from "primereact/inplace";
import { FileUpload } from "primereact/fileupload";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import axios from "axios";

const Profile = () => {
  const { isAuthenticated, user, redirect, loading } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();
  const [avatar, setAvatar] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [country, setCountry] = useState("");
  const [countriesList, setCountriesList] = useState([]);
  const countryservice = new CountryService();
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    countryservice.getCountries().then((data) => {
      setCountriesList(data);
      console.log(data);
      // setCountry(country);
    });
  }, []);

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
    if (isAuthenticated && user) {
      setAvatar(user.avatar);
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
    const payload = {
      avatar: avatar,
      first_name: firstName,
      last_name: lastName,
      email: email,
      birth_date: birthDate,
      country: country,
    };
    await axios.post("edit-profile", payload).then((data) => {
      console.log(data);
    });
  };

  const onChangeAvatar = (e) => {
    let fileReader = new FileReader();
    fileReader.onload = (e) => {
      setAvatar(e.target.result);
    };
    fileReader.readAsDataURL(e.target.files[0]);
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
    setBirthDate(e.target.value);
  };

  const onChangeCountry = (e) => {
    setCountry(e.target.value);
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
      <h2 className="text-center">My Profile</h2>
      <div className="grid grid-nogutter pl-3 pr-3 pt-1 surface-card">
        <div className="col-4 p-2">
          <Image src={avatar} width="100%" alt="avatar" preview={true} />
        </div>
        <div className="col-8 p-2">
          <p>
            <span className="font-bold inline-flex mr-2">Name: </span>
            {firstName} {lastName}
          </p>
          <p>
            <span className="font-bold inline-flex mr-2">Email: </span>
            {email}
          </p>
          <p>
            <span className="font-bold inline-flex mr-2">Birth Date: </span>
            {birthDate}
          </p>
          <p>
            <span className="font-bold inline-flex mr-2">Country: </span>
            {country}
          </p>
        </div>
      </div>
    </UserLayout>
  ) : (
    <> </>
  );
};

export default Profile;
