import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { Amplify } from "aws-amplify";
// import outputs from "../amplify_outputs.json";
import amplifyConfig from './amplify-config';

// Amplify.configure(outputs);
Amplify.configure(amplifyConfig)

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
