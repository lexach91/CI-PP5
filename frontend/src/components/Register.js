import React, { useEffect, useState, useRef } from "react";
import { Form, Field } from "react-final-form";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { Dropdown } from "primereact/dropdown";
import { Calendar } from "primereact/calendar";
import { Password } from "primereact/password";
import { Checkbox } from "primereact/checkbox";
import { Dialog } from "primereact/dialog";
import { Divider } from "primereact/divider";
import { classNames } from "primereact/utils";
import { CountryService } from "../service/CountryService";
import { Messages } from "primereact/messages";
import { Navigate } from "react-router-dom";
import { register, resetRedirect } from "../redux/authSlice";
import { useSelector } from "react-redux";
import { useDispatch } from "react-redux";
import RotateLoader from "react-spinners/RotateLoader";
import VisitorLayout from "../layouts/VisitorLayout";
import { Link } from "react-router-dom";
import { TermsHtml } from "../privacy/TermsOfUse";

const Register = () => {
  const [countries, setCountries] = useState([]);
  const [showMessage, setShowMessage] = useState(false);
  const [formData, setFormData] = useState({});
  const countryservice = new CountryService();
  const messages = useRef(null);
  const { redirect, loading, isAuthenticated } = useSelector(
    (state) => state.auth
  );
  const dispatch = useDispatch();

  useEffect(() => {
    countryservice.getCountries().then((data) => setCountries(data));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const validate = (data) => {
    let errors = {};

    if (!data.first_name) {
      errors.first_name = "Firsts name is required.";
    }

    if (!data.last_name) {
      errors.last_name = "Last name is required.";
    }

    if (!data.email) {
      errors.email = "Email is required.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
      errors.email = "Invalid email address. E.g. example@email.com";
    }

    if (!data.password1) {
      errors.password1 = "Password is required.";
    }

    if (!data.password2) {
      errors.password2 = "Confirm password is required.";
    }

    if (data.password1 !== data.password2) {
      errors.password2 = "Passwords must match.";
    }

    if (!data.date) {
      errors.date = "Birthday is required.";
    }

    // check if person is at least 13 years old
    const today = new Date();
    const birthDate = new Date(data.date);
    const age = today.getFullYear() - birthDate.getFullYear();
    if (age < 13) {
      errors.date = "You must be at least 13 years old to register.";
    }

    if (!data.country) {
      errors.country = "Country is required.";
    }

    if (!data.accept) {
      errors.accept = "You need to agree to the terms and conditions.";
    }

    return errors;
  };

  const onSubmit = async (data, form) => {
    setFormData(data);
    const payloadUser = {
      email: data.email,
      password: data.password1,
      password_confirm: data.password2,
      first_name: data.first_name,
      last_name: data.last_name,
      birth_date: data.date.toISOString().substring(0, 10),
      country: data.country,
    };
    dispatch(register(payloadUser));
  };

  if (redirect) {
    return <Navigate to="/login" />;
  }

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
    );
  };

  const dialogFooter = (
    <div className="flex justify-content-center">
      <Button
        label="Close"
        className="p-button-text"
        autoFocus
        onClick={() => {
          setShowMessage(false);          
        }}
      />
    </div>
  );
  const passwordHeader = <h6>Pick a password</h6>;
  const passwordFooter = (
    <React.Fragment>
      <Divider />
      <p className="mt-2">Suggestions</p>
      <ul className="pl-2 ml-2 mt-0" style={{ lineHeight: "1.5" }}>
        <li>At least one lowercase</li>
        <li>At least one uppercase</li>
        <li>At least one numeric</li>
        <li>Minimum 8 characters</li>
      </ul>
    </React.Fragment>
  );

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
    <VisitorLayout title="Register">
      <div className="form-register p-5">
        <Messages ref={messages}></Messages>
        <Dialog
          visible={showMessage}
          onHide={() => setShowMessage(false)}
          position="center"
          footer={dialogFooter}
          header="Terms and Conditions"
          breakpoints={{ "960px": "80vw", "650px": "100vw" }}
          style={{ width: "60vw" }}
          contentClassName="p-3"
          >
          <TermsHtml />
        </Dialog>

        <div className="flex justify-content-center h-full">
          <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
            <h5 className="text-center">Register</h5>
            <Form
              onSubmit={onSubmit}
              initialValues={{
                first_name: "",
                last_name: "",
                email: "",
                password1: "",
                password2: "",
                date: null,
                country: null,
                accept: false,
              }}
              validate={validate}
              render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit} className="p-fluid">
                  <Field
                    name="first_name"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <InputText
                            id="first_name"
                            {...input}
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label
                            htmlFor="first_name"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            First name*
                          </label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="last_name"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <InputText
                            id="last_name"
                            {...input}
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label
                            htmlFor="last_name"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            Last name*
                          </label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="email"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label p-input-icon-right">
                          <i className="pi pi-envelope" />
                          <InputText
                            id="email"
                            {...input}
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label
                            htmlFor="email"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            Email*
                          </label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="password1"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <Password
                            id="password1"
                            {...input}
                            toggleMask
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                            header={passwordHeader}
                            footer={passwordFooter}
                          />
                          <label
                            htmlFor="password1"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            Password*
                          </label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="password2"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <Password
                            id="password2"
                            {...input}
                            toggleMask
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                            feedback={false}
                          />
                          <label
                            htmlFor="password2"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            Confirm password*
                          </label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="date"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <Calendar
                            id="date"
                            {...input}
                            dateFormat="dd/mm/yy"
                            mask="99/99/9999"
                            showIcon
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label htmlFor="date">Birthday*</label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="country"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <Dropdown
                            id="country"
                            {...input}
                            options={countries}
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label htmlFor="country">Country*</label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="accept"
                    type="checkbox"
                    render={({ input, meta }) => (
                      <div className="field-checkbox">
                        <Checkbox
                          inputId="accept"                          
                          {...input}
                          className={classNames({
                            "p-invalid": isFormFieldValid(meta),
                          })}
                        />
                        <label
                          htmlFor="accept"
                          className={classNames({
                            "p-error": isFormFieldValid(meta),
                          })}>
                          I agree to the 
                          <a 
                            href="javascript:(void(0))"
                            onClick={() => setShowMessage(true)}
                            className="text-blue-500"
                            aria-label="Terms and Conditions"
                          > {" "}Terms and Conditions</a>
                            


                        </label>
                      </div>
                    )}
                  />

                  <Button
                    icon="pi pi-user-plus"
                    type="submit"
                    label="Register"
                    className="mt-2"
                  />
                </form>
              )}
            />
            <p className="text-muted mt-3">
              Already have an account?{" "}
              <Link className="text-blue-500" to="/login">
                Login
              </Link>
            </p>
          </div>
        </div>
      </div>
    </VisitorLayout>
  );
};

export default Register;
