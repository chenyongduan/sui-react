import React from "react";
import ReactDOM from "react-dom/client";
import { WalletKitProvider } from "@mysten/wallet-kit";
import { ConfigProvider } from "antd";
import MainPage from "./pages/main-page";
import "./index.less";

// useEffect(() => {
//   subscribeEventByNft();
//   return () => {
//     removeSubscribeByNft();
//   };
// }, []);

// const subscribeEventByNft = useCallback(async () => {
//   subscribeIdRef.current = await suiProviderRef.current.subscribeEvent(
//     devnetNftFilter,
//     (event: SuiEventEnvelope) => {
//       // handle subscription notification message here
//       // console.log(event);
//     }
//   );
// }, []);

// const removeSubscribeByNft = async () => {
//   if (subscribeIdRef.current) {
//     await suiProviderRef.current.unsubscribeEvent(subscribeIdRef.current);
//   }
// };

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
        <MainPage />
      </ConfigProvider>
    </WalletKitProvider>
  </React.StrictMode>
);
