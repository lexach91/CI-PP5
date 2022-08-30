import {
  render,
  screen,
  cleanup,
  getDefaultNormalizer,
} from "@testing-library/react";
import App from "./App";
import React from "react";
import { MemoryRouter } from "react-router-dom";
import "./api/axios";
import { store } from "./redux/store";
import { Provider } from "react-redux";
import "./polyfills";
import Home from "./components/Home";

afterEach(cleanup);

describe("Home page", () => {
  test("renders without crashing", () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Home/i);
    expect(linkElement).toBeInTheDocument();
  });
  test("has a button leading to the pricing page", () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText("Pricing");
    expect(linkElement).toBeInTheDocument();
  });
  test("has a link to the register page", () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Register/i);
    expect(linkElement).toBeInTheDocument();
  });
  test("has a link to the login page", () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Login/i);
    expect(linkElement).toBeInTheDocument();
  });
  test("has a learn more button", () => {
    const { getByText } = render(
      <Provider store={store}>
        <MemoryRouter>
          <Home />
        </MemoryRouter>
      </Provider>
    );
    const linkElement = getByText(/Learn More/i);
    expect(linkElement).toBeInTheDocument();
  });
});
