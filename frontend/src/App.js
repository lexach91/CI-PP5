import logo from './logo.svg';
import './App.css';
import "primereact/resources/themes/mdc-dark-indigo/theme.css";
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import Navbar from './components/navigation/VisitorNavbar';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { checkAuth } from './redux/authSlice';
import { useEffect } from 'react';
import PrimeReact from 'primereact/api';
import Profile from './components/Profile';
import Settings from './components/Settings';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';
import axios from 'axios';
// import { Navigate } from 'react-router-dom';
import Pricing from './components/Pricing';




const App = () => {
  PrimeReact.ripple = true;
  PrimeReact.cssTransitions = true;

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, []);

  const checkUserInRoom = async () => {
    await axios.get('/rooms/check-user-in-room')
      .then(res => {
        console.log(res);
        if (res.data.room_token && window.location.pathname !== `/room/${res.data.room_token}`) {
          console.log('user is in room');
          window.location.href = `/room/${res.data.room_token}`;
        }
      }
      )
      .catch(err => {
        console.log(err);
      }
      );
  };

  useEffect(() => {
    checkUserInRoom();
  }, []);


  return (
    <div className="App">
      
        <Router>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/create-room" element={<CreateRoom />} />
            <Route path="/room/:roomToken" element={<Room />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </Router>

    </div>
  );
}

export default App;
