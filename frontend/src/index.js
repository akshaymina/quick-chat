import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import "./index.css";
import App from "./App";
import { Toaster } from "react-hot-toast";
import { Provider } from "react-redux";
import store from "./redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { persistStore } from "redux-persist";
import { ThemeProvider } from "./context/ThemeContext";
import { setAuthUser, setOtherUsers, setSelectedUser } from "./redux/userSlice";

const persistor = persistStore(store);

// If the session cookie expires (or is rejected) the persisted "logged in"
// state would otherwise stay forever and every request would fail with 401.
// Clear it so the app redirects to /login.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLoginCall = error.config?.url?.includes("/api/v1/user/login");
    if (error.response?.status === 401 && !isLoginCall) {
      const { authUser } = store.getState().user;
      if (authUser) {
        store.dispatch(setAuthUser(null));
        store.dispatch(setSelectedUser(null));
        store.dispatch(setOtherUsers(null));
      }
    }
    return Promise.reject(error);
  }
);

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <ThemeProvider>
          <App />
          <Toaster />
        </ThemeProvider>
      </PersistGate>
    </Provider>
  </React.StrictMode>
);
