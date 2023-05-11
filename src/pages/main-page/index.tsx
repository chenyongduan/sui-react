import { useCallback, useEffect, useRef, useState } from "react";
import { JsonRpcProvider, devnetConnection } from "@mysten/sui.js";
import { ConnectButton, useWalletKit } from "@mysten/wallet-kit";
import { useNavigate } from "react-router-dom";
import { Button } from "antd";
import { fullPriceToSuiPrice } from "qUtils";
import NftsSection from "./nfts-section";
import MarketSection from "./market-section";
import ButtonSection from "./button-section";
import styles from "./index.module.less";

const SECTION_LIST = [
  {
    name: "My Nfts",
    component: NftsSection,
  },
  {
    name: "Market",
    component: MarketSection,
  },
];

const MainPage = () => {
  const { currentAccount, isConnected } = useWalletKit();
  const data = useWalletKit();
  const suiProviderRef = useRef(new JsonRpcProvider(devnetConnection));
  const navigate = useNavigate();
  const [balance, setBalance] = useState(0);
  const [selectId, setSelectId] = useState(0);

  useEffect(() => {
    if (currentAccount) {
      refreshBalance(currentAccount.address);
    } else {
      setBalance(0);
    }
  }, [currentAccount]);

  const refreshBalance = async (addressId: string) => {
    try {
      const balance = await suiProviderRef.current.getBalance({
        owner: addressId,
      });
      setBalance(Number(balance.totalBalance));
    } catch {}
  };

  const onSectionChange = useCallback((index: number) => {
    setSelectId(index);
  }, []);

  const onGoToThreePage = useCallback(() => {
    navigate("threePage");
  }, []);

  const SectionComponent = SECTION_LIST[selectId].component;
  return (
    <div className={styles.basePage}>
      <div className={styles.navBar}>
        <div className={styles.navBarLeftView}>
          <p className={styles.navBarTitle}>Stone</p>
          <Button onClick={onGoToThreePage} style={{ marginLeft: 20 }}>
            ThreePage
          </Button>
          <Button
            onClick={() => {
              navigate("p2Page");
            }}
            style={{ marginLeft: 20 }}
          >
            P2Page
          </Button>
        </div>
        <div className={styles.navBarInfo}>
          <p>当前账号：</p>
          <ConnectButton />
          <div className={styles.balance}>
            代币：{fullPriceToSuiPrice(balance)} <span>SUI</span>
          </div>
        </div>
      </div>
      <ButtonSection
        data={SECTION_LIST}
        selectId={selectId}
        onChange={onSectionChange}
      />
      <div className={styles.contentView}>
        {isConnected && <SectionComponent />}
      </div>
    </div>
  );
};

export default MainPage;
