import "./App.css";
import "primereact/resources/themes/mdc-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import Home from "./components/Home";
import Register from "./components/Register";
import Login from "./components/Login";
import ResetPassword from "./components/ResetPassword";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { checkAuth, resetError, resetMessage } from "./redux/authSlice";
import { useEffect, useRef } from "react";
import PrimeReact from "primereact/api";
import Profile from "./components/Profile";
import Settings from "./components/Settings";
import Checkout from "./components/Checkout";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";
import JoinRoom from "./components/JoinRoom";
import TermsOfUse from "./privacy/TermsOfUse";
import Privacy from "./privacy/Privacy";
import ContactUs from "./components/ContactUs";
import UnsubscribeNewsletter from "./components/NewsletterUnsubscribe";
import axios from "axios";
import Pricing from "./components/Pricing";
import Subscription from "./components/Subscription";
import Page404 from "./errors/Page404";
import Page500 from "./errors/Page500";
import { Toast } from "primereact/toast";

const App = () => {
  PrimeReact.ripple = true;
  PrimeReact.cssTransitions = true;

  const dispatch = useDispatch();
  const { user, isAuthenticated, error, message } = useSelector(
    (state) => state.auth
  );
  const toast = useRef(null);

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  useEffect(() => {
    if (error) {
      if (typeof error === "object") {
        for (let i = 0; i < error.length; i++) {
          toast.current.show({
            severity: "error",
            summary: "Error",
            detail: error[i],
            life: 7000,
          });
        }
      } else {
        toast.current.show({
          severity: "error",
          summary: "Error",
          detail: error,
          life: 7000,
        });
      }
      setTimeout(() => {
        dispatch(resetError());
      }, 7000);
    }
  }, [error]);

  useEffect(() => {
    if (message) {
      toast.current.show({
        severity: "success",
        summary: "Success",
        detail: message,
        life: 7000,
      });
      setTimeout(() => {
        dispatch(resetMessage());
      }, 7000);
    }
  }, [message]);

  const checkUserInRoom = async () => {
    await axios
      .get("/rooms/check-user-in-room")
      .then((res) => {
        if (
          res.data.room_token &&
          window.location.pathname !== `/room/${res.data.room_token}`
        ) {
          window.location.href = `/room/${res.data.room_token}`;
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      checkUserInRoom();
    }
  }, [isAuthenticated, user]);

  return (
    <div className="App">
      <Toast ref={toast} style={{ zIndex: 10001 }} />

      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/create-room" element={<CreateRoom />} />
          <Route path="/room/:roomToken" element={<Room />} />
          <Route path="/join-room/:roomToken" element={<JoinRoom />} />
          <Route path="/pricing" element={<Pricing />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/subscription" element={<Subscription />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />
          <Route path="/terms-of-use" element={<TermsOfUse />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/contact" element={<ContactUs />} />
          <Route
            path="/unsubscribe/:email"
            element={<UnsubscribeNewsletter />}
          />
          <Route path="/unsubscribe" element={<UnsubscribeNewsletter />} />
          <Route path="/500" element={<Page500 />} />
          <Route path="*" element={<Page404 />} />
        </Routes>
      </Router>
    </div>
  );
};

export default App;
