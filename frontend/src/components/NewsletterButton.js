import { useState } from "react";
import { Button } from "primereact/button";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import { setError, setMessage } from "../redux/authSlice";
import { InputText } from "primereact/inputtext";
import { Form, Field } from "react-final-form";
import { classNames } from "primereact/utils";
import { Dialog } from 'primereact/dialog';


const NewsletterButton = () => {
    const [formData, setFormData] = useState({});
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth);
    const [submitting, setSubmitting] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const validate = (data) => {
        let errors = {};
        if (!data.email) {
            errors.email = "Required";
        } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(data.email)) {
            errors.email = "Invalid email address";
        }
        return errors;
    };

    const onSubmit = async (data) => {
        setFormData(data);
        setSubmitting(true);
        try {
            await axios.post("newsletter/subscribe", {email: data.email});
            dispatch(setMessage("You have been subscribed to our newsletter"));
            setDialogVisible(false);
        }
        catch (error) {
            dispatch(setError(error.response.data.error));
        }
        setSubmitting(false);
    };

    const isFormFieldValid = (meta) => !!(meta.touched && meta.error);
    const getFormErrorMessage = (meta) => {
        return (
            isFormFieldValid(meta) && <small className="p-error">{meta.error}</small>
          );
    };


    const dialog = () => {
        return (
            <Dialog
                header="Subscribe to our newsletter"
                visible={dialogVisible}
                className="w-full md:w-6 md:mx-auto"
                onHide={() => {
                    setDialogVisible(false);
                    setFormData({});
                }}
                >
                    <Form
                    onSubmit={onSubmit}
                    validate={validate}
                    initialValues={{ email: user ? user.email : "" }}
                    render={({ handleSubmit }) => (
                        <form onSubmit={handleSubmit} className="pt-3">
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
                                                    "w-full": true,
                                                })}
                                            />
                                            <label htmlFor="email" className={classNames({
                                                "p-error": isFormFieldValid(meta),
                                            })}>
                                                Email
                                            </label>
                                        </span>
                                        {getFormErrorMessage(meta)}
                                    </div>
                                )}
                            />
                            <Button
                                label="Subscribe"
                                type="submit"
                                className="p-button-primary"
                                disabled={submitting}
                                id="newsletter-submit"
                            />

                        </form>
                    )}
                />
                </Dialog>
        );
    }

        


    
    return (<>
    <a href="javascript:void(0)" onClick={() => setDialogVisible(true)} className="block no-underline text-gray-500 p-2 m-2">
        Newsletter
    </a>
    {dialog()}
    
    </>
    )
}

export default NewsletterButton;