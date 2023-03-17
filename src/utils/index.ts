import { notification } from "antd";

export const checkWalletConnect = (isConnected: boolean) => {
  if (isConnected) return true;
  notification.warning({
    message: "请先连接钱包",
    placement: "top",
  });
  return false;
};

export const fullPriceToSuiPrice = (fullPrice: string | number) => {
  return Number(fullPrice) / 1000000000;
};
