import React from "react";
import ReactDOM from "react-dom/client";
import { WalletKitProvider } from "@mysten/wallet-kit";
import { ConfigProvider } from "antd";
import { HashRouter } from "react-router-dom";
import App from "./pages/app";
import "./index.less";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <WalletKitProvider>
      <ConfigProvider
        theme={{
          token: {
            colorPrimary: "rgb(31 100 147)",
          },
        }}
      >
        <HashRouter>
          <App />
        </HashRouter>
      </ConfigProvider>
    </WalletKitProvider>
  </React.StrictMode>
);
