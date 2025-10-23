import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./index.css";
import { Toaster } from "react-hot-toast";
import { HashRouter } from "react-router-dom"; // ✅ Import HashRouter

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <HashRouter>  {/* ✅ Wrap App inside HashRouter */}
      <Toaster position="top-center" reverseOrder={false} />
      <App />
    </HashRouter>
  </Provider>
);
