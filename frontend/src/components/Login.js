import React, { useState } from "react";
import { Form, Field } from "react-final-form";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Password } from "primereact/password";
import { classNames } from 'primereact/utils';
import axios from "axios";
import { Navigate } from "react-router-dom";


const Login = () => {
    const [formData, setFormData] = useState({});
    const [redirect, setRedirect] = useState(false);

    const validate = (data) => {
        let errors = {};

        if (!data.email) {
            errors.email = 'Email is required to login.';
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
            errors.email = 'Invalid email address. E.g. example@email.com';
        }

        if (!data.password) {
            errors.password = 'Password is required to login.';
        }

        return errors;
    };

    const onSubmit = async (data) => {
        setFormData(data);
        const payload = {
            email: data.email,
            password: data.password,
        };
        const response = await axios.post("login", payload);
        console.log(response);
        if (response.status === 200) {
            axios.defaults.headers.common.Authorization = `Bearer ${response.data.token}`;
            setRedirect(true);
        } else if (response.response.status === 403) {
            alert("Invalid email or password");
        } else {
            alert("Something went wrong");
        }

    };

    if (redirect) {
        return <Navigate to="/" />;
    }

    const isFormFieldValid = (meta) => !!(meta.error && meta.touched);
    const getFormErrorMessage = (meta) => {
        return isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>;
    };

    return (
        <div className="form-login pt-5">
            <div className="flex justify-content-center h-full">
                <div className="surface-card p-4 shadow-2 border-round w-full lg:w-6">
                    <h5 className="text-center">Login</h5>
                    <Form onSubmit={onSubmit} initialValues={{ email: "", password: "" }} validate={validate} render={({ handleSubmit }) => (
                        <form onSubmit={handleSubmit} className="p-fluid">
                            <Field name="email" render={({ input, meta }) => (
                                <div className="field">
                                    <span className="p-float-label">
                                        <InputText id="email" {...input} autoFocus className={classNames({ 'p-invalid': isFormFieldValid(meta) })} />
                                        <label htmlFor="email" className={classNames({ 'p-error': isFormFieldValid(meta) })}>Email*</label>
                                    </span>
                                    {getFormErrorMessage(meta)}
                                </div>
                            )} />
                            <Field name="password" render={({ input, meta }) => (
                                <div className="field">
                                    <span className="p-float-label">
                                        <Password id="password" {...input} toggleMask feedback={false} className={classNames({ 'p-invalid': isFormFieldValid(meta) })} />
                                        <label htmlFor="password" className={classNames({ 'p-error': isFormFieldValid(meta) })}>Password*</label>
                                    </span>
                                    {getFormErrorMessage(meta)}
                                </div>
                            )} />

                            <Button type="submit" label="Login" className="mt-2" icon="pi pi-user" />

                        </form>
                    )} />
                </div>
            </div>
        </div>
    );
}

export default Login;