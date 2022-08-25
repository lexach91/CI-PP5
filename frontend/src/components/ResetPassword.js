import React, { useEffect, useState } from "react";
import { Form, Field } from "react-final-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from "primereact/utils";
import axios from "axios";
import { Navigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { resetRedirect, setMessage, setError } from "../redux/authSlice";
import RotateLoader from "react-spinners/RotateLoader";
import VisitorLayout from "../layouts/VisitorLayout";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";


const ResetPassword = () => {
    const [formData, setFormData] = useState({});
    const dispatch = useDispatch();
    const { loading, redirect, isAuthenticated } = useSelector((state) => state.auth);
    const [ resetPasswordToken, setResetPasswordToken ] = useState(null);
    const { token } = useParams();
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (token) {
            setResetPasswordToken(token);
        }
    } , [token]);


    const validateEmailForm = (data) => {
        let errors = {};

        if (!data.email) {
            errors.email = "Email is required to reset password.";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
            errors.email = "Invalid email address. E.g. example@email.com";
        }

        return errors;
    };

    const validatePasswordForm = (data) => {
        let errors = {};

        if (!data.password) {
            errors.password = "Password is required!";
        }

        if (!data.confirmPassword) {
            errors.confirmPassword = "Confirm password is required!";
        }

        if (data.password !== data.confirmPassword) {
            errors.confirmPassword = "Passwords do not match!";
        }


        return errors;
    };

    const onSubmitEmail = async (data) => {
        setFormData(data);
        setSubmitting(true);
        const payload = {
            email: data.email,
        };
        try {
            const response = await axios.post("forgot-password", payload);
            dispatch(setMessage("If an account exists, you will receive an email with instructions shortly."));
            setTimeout(() => {
                window.location.href = "/";
            } , 3000);
        }
        catch (error) {
            dispatch(setError("An error occurred. Please try again."));
            setSubmitting(false);
        }
    };

    const onSubmitPassword = async (data) => {
        setFormData(data);
        setSubmitting(true);
        const payload = {
            password: data.password,
            password_confirm: data.confirmPassword,
            token: resetPasswordToken,
        };
        try {
            const response = await axios.post("reset-password", payload);
            dispatch(setMessage("Password successfully reset. You can now login."));
            setTimeout(() => {
                window.location.href = "/login";
            }, 3000);
        }
        catch (error) {
            dispatch(setError("An error occurred. Please try again."));
            setSubmitting(false);
        }
    };

    if(isAuthenticated) {
        setError("You are already logged in.");
        return <Navigate to="/" />;
    };

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
        <VisitorLayout title="Reset Password">
            <div className="form-container p-5">
                <div className="flex justify-content-center h-full">
                    <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
                        <h5 className="text-center">Reset Password</h5>
                        {resetPasswordToken ? (
                            <Form
                                onSubmit={onSubmitPassword}
                                initialValues={{
                                    password: "",
                                    confirmPassword: "",
                                }}
                                validate={validatePasswordForm}
                                render={({ handleSubmit }) => (
                                    <form onSubmit={handleSubmit} className="p-fluid">
                                        <Field
                                            name="password"
                                            render={({ input, meta }) => (
                                                <div className="field">
                                                    <span className="p-float-label">
                                                        <Password
                                                            id="password"
                                                            {...input}
                                                            toggleMask
                                                            disabled={submitting}
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
                                        <Field
                                            name="confirmPassword"
                                            render={({ input, meta }) => (
                                                <div className="field">
                                                    <span className="p-float-label">
                                                        <Password
                                                            id="confirmPassword"
                                                            {...input}
                                                            toggleMask
                                                            disabled={submitting}
                                                            feedback={false}
                                                            className={classNames({
                                                                "p-invalid": isFormFieldValid(meta),
                                                            })}
                                                        />
                                                        <label
                                                            htmlFor="confirmPassword"
                                                            className={classNames({
                                                                "p-error": isFormFieldValid(meta),
                                                            })}>
                                                            Confirm Password*
                                                            </label>
                                                            </span>
                                                    {getFormErrorMessage(meta)}
                                                </div>
                                            )}
                                        />
                                        <Button
                                            type="submit"
                                            label="Reset Password"
                                            className="p-button-primary mt-2"
                                            disabled={submitting}
                                            loading={submitting}
                                        />
                                    </form>
                                )}
                            />
                        ) : (
                            <Form
                                onSubmit={onSubmitEmail}
                                initialValues={{
                                    email: "",
                                }}
                                validate={validateEmailForm}
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
                                                            disabled={submitting}
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
                                        <Button
                                            type="submit"
                                            label="Submit"
                                            className="p-button-primary mt-2"
                                            disabled={submitting}
                                            loading={submitting}
                                        />
                                    </form>
                                )}
                            />
                        )}
                    </div>
                </div>
            </div>
        </VisitorLayout>
    );
}

export default ResetPassword;