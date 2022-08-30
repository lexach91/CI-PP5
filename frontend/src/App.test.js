import { render, screen, cleanup, getDefaultNormalizer } from '@testing-library/react';
import App from './App';
import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import './api/axios';
import { store } from './redux/store';
import { Provider } from 'react-redux';
import './polyfills';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Profile from './components/Profile';
import Settings from './components/Settings';
import Checkout from './components/Checkout';
import CreateRoom from './components/CreateRoom';
import Room from './components/Room';
import JoinRoom from './components/JoinRoom';
import TermsOfUse from './privacy/TermsOfUse';
import Privacy from './privacy/Privacy';
import ContactUs from './components/ContactUs';
import UnsubscribeNewsletter from './components/NewsletterUnsubscribe';
import Pricing from './components/Pricing';
import Subscription from './components/Subscription';
import Page404 from './errors/Page404';
import Page500 from './errors/Page500';


afterEach(cleanup);

describe('Home page', () => {
  test('renders without crashing', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Home/i);
    expect(linkElement).toBeInTheDocument();
  })
  test('has a button leading to the pricing page', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText("Pricing");
    expect(linkElement).toBeInTheDocument();
  })
  test('has a link to the register page', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Register/i);
    expect(linkElement).toBeInTheDocument();
  })
  test('has a link to the login page', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Login/i);
    expect(linkElement).toBeInTheDocument();
  })
  test('has a learn more button', () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Learn More/i);
    expect(linkElement).toBeInTheDocument();
  })
});
