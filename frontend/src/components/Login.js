import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login, resetRedirect } from "../redux/authSlice";
import RotateLoader from "react-spinners/RotateLoader";
import VisitorLayout from "../layouts/VisitorLayout";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({});
  const dispatch = useDispatch();
  const { loading, redirect, isAuthenticated } = useSelector((state) => state.auth);

  const validate = (data) => {
    let errors = {};

    if (!data.email) {
      errors.email = "Email is required to login.";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
      errors.email = "Invalid email address. E.g. example@email.com";
    }

    if (!data.password) {
      errors.password = "Password is required to login.";
    }

    return errors;
  };

  const onSubmit = async (data) => {
    setFormData(data);
    const payload = {
      email: data.email,
      password: data.password,
    };
    dispatch(login(payload));
  };

  useEffect(() => {
    if (redirect) {
      dispatch(resetRedirect());
    }
  }, [redirect]);

  if (isAuthenticated) {
    return <Navigate to="/" />;
  }

  const isFormFieldValid = (meta) => !!(meta.error && meta.touched);
  const getFormErrorMessage = (meta) => {
    return (
      isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
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
    <VisitorLayout title="Login">
    <div className="form-login p-5">
      <div className="flex justify-content-center h-full">
        <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
          <h5 className="text-center">Login</h5>
          <Form
            onSubmit={onSubmit}
            initialValues={{ email: "", password: "" }}
            validate={validate}
            render={({ handleSubmit }) => (
              <form onSubmit={handleSubmit} className="p-fluid">
                <Field
                  name="email"
                  render={({ input, meta }) => (
                    <div className="field">
                      <span className="p-float-label">
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
                  name="password"
                  render={({ input, meta }) => (
                    <div className="field">
                      <span className="p-float-label">
                        <Password
                          id="password"
                          {...input}
                          toggleMask
                          feedback={false}
                          className={classNames({
                            "p-invalid": isFormFieldValid(meta),
                          })}
                        />
                        <label
                          htmlFor="password"
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

                <Button
                  type="submit"
                  label="Login"
                  className="mt-2"
                  icon="pi pi-user"
                />
              </form>
            )}
          />
          <p className="text-muted mt-3">
            Don't have an account? <Link className="text-blue-500" to="/register" aria-label="Register">Register</Link>
          </p>
          <p className="text-muted mt-3">
            Forgot your password? <Link className="text-blue-500" to="/reset-password" aria-label="Reset Password">Reset Password</Link>
          </p>
        </div>
      </div>
    </div>
    </VisitorLayout>
  );
};

export default Login;
