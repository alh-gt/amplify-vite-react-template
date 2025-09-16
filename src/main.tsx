import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
// import outputs from "../amplify_outputs.json";
import amplifyConfig from './amplify-config';
import { mountAuthHubLogger } from './auth-hub-log';

// Amplify.configure(outputs);
Amplify.configure(amplifyConfig);

mountAuthHubLogger();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
