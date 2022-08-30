import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import RotateLoader from "react-spinners/RotateLoader";
import VisitorLayout from "../layouts/VisitorLayout";
import UserLayout from "../layouts/UserLayout";
import { Button } from "primereact/button";
import { Form, Field } from "react-final-form";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { InputTextarea } from "primereact/inputtextarea";
import { setMessage, setError } from "../redux/authSlice";
import axios from "axios";
import { classNames } from "primereact/utils";

const ContactUs = () => {
  const { loading, user, isAuthenticated } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = (data) => {
    let errors = {};
    if (!data.name) {
      errors.name = "Name is required";
    }
    if (!data.email) {
      errors.email = "Email is required";
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
      errors.email = "Invalid email address. E.g. example@email.com";
    }
    if (!data.subject) {
      errors.subject = "Subject is required";
    }
    if (!data.message) {
      errors.message = "Message is required";
    }
    return errors;
  };

  const contactSubjects = [
    { label: "General", value: "General" },
    { label: "Support", value: "Support" },
    { label: "Payments", value: "Payments" },
    { label: "Other", value: "Other" },
  ];

  const onSubmit = async (data, form) => {
    setFormData(data);
    setSubmitting(true);
    try {
      await axios.post("contact-us", data);
      dispatch(
        setMessage(
          "We have received your message. We will get back to you shortly."
        )
      );
      setSubmitting(false);
      setFormData({});
      form.restart();
    } catch (err) {
      dispatch(setError(err.response.data));
      setSubmitting(false);
    }
  };

  const LayoutComponent = isAuthenticated ? UserLayout : VisitorLayout;

  const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
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
    <LayoutComponent title="Contact Us">
      <div className="form-container p-5">
        <div className="flex justify-content-center h-full">
          <div className="surface-card p-4 shadow-2 border-round w-full md:w-8 lg:w-6 md:mx-auto">
            <h5 className="text-center">Contact Us</h5>
            <Form
              onSubmit={onSubmit}
              initialValues={{
                name: user ? `${user.first_name} ${user.last_name}` : "",
                email: user ? user.email : "",
                subject: "",
                message: "",
              }}
              validate={validate}
              render={({ handleSubmit }) => (
                <form onSubmit={handleSubmit} className="p-fluid">
                  <Field
                    name="name"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <InputText
                            id="name"
                            disabled={user ? true : false}
                            {...input}
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label
                            htmlFor="name"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            Name*
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
                        <span className="p-float-label">
                          <InputText
                            id="email"
                            disabled={user ? true : false}
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
                    name="subject"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <Dropdown
                            id="subject"
                            {...input}
                            options={contactSubjects}
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label
                            htmlFor="subject"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            Subject*
                          </label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <Field
                    name="message"
                    render={({ input, meta }) => (
                      <div className="field">
                        <span className="p-float-label">
                          <InputTextarea
                            id="message"
                            {...input}
                            autoResize
                            rows={10}
                            className={classNames({
                              "p-invalid": isFormFieldValid(meta),
                            })}
                          />
                          <label
                            htmlFor="message"
                            className={classNames({
                              "p-error": isFormFieldValid(meta),
                            })}>
                            Message*
                          </label>
                        </span>
                        {getFormErrorMessage(meta)}
                      </div>
                    )}
                  />
                  <div className="field">
                    <Button
                      type="submit"
                      label="Submit"
                      className="p-button-raised p-button-rounded p-button-primary"
                      disabled={submitting}
                      loading={submitting}
                    />
                  </div>
                </form>
              )}
            />
          </div>
        </div>
      </div>
    </LayoutComponent>
  );
};

export default ContactUs;
