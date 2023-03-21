import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  JsonRpcProvider,
  devnetConnection,
  GetObjectDataResponse,
} from "@mysten/sui.js";
import { useWalletKit } from "@mysten/wallet-kit";
import { Button, notification, Spin } from "antd";
import { isEmpty } from "underscore";
import StoneItem from "../components/stone-item";
import {
  STONE_CREATE_METHOD,
  STONE_MODULE_NAME,
  STONE_PACKAGE_ID,
  STONE_REGISTER_SHARE_ID,
  STONE_TYPE,
} from "qConstants";
import { checkWalletConnect } from "qUtils";
import EmptyPage from "qComponents/empty-page";
import styles from "./index.module.less";

type NftData = {
  type: string;
  fields: {
    name?: string;
    url?: string;
    id: { id: string };
    attributes: Array<{
      type: string;
      fields: { name: string; value: string };
    }>;
  };
};

function NftsSection() {
  const { currentAccount, isConnected, signAndExecuteTransaction } =
    useWalletKit();
  const suiProviderRef = useRef(new JsonRpcProvider(devnetConnection));
  const [nftList, setNftList] = useState<GetObjectDataResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentAccount) {
      refreshObjects(currentAccount, true);
    }
  }, [currentAccount]);

  const refreshObjects = async (addressId: string, showLoading?: boolean) => {
    try {
      if (showLoading) setLoading(true);
      const objects = await suiProviderRef.current.getObjectsOwnedByAddress(
        addressId
      );
      const nftObjectList: string[] = [];
      objects.map((data) => {
        if (data.type.match(STONE_TYPE)) {
          nftObjectList.push(data.objectId);
        }
      });
      if (nftObjectList) {
        const nftList = await suiProviderRef.current.getObjectBatch(
          nftObjectList
        );
        setNftList(nftList);
      }
    } finally {
      setLoading(false);
    }
  };

  const onBuyStone = useCallback(async () => {
    if (!checkWalletConnect(isConnected)) return;
    try {
      await signAndExecuteTransaction({
        kind: "moveCall",
        data: {
          packageObjectId: STONE_PACKAGE_ID,
          module: STONE_MODULE_NAME,
          function: STONE_CREATE_METHOD,
          typeArguments: [],
          arguments: [STONE_REGISTER_SHARE_ID],
          gasBudget: 10000,
        },
      });
      setTimeout(() => {
        refreshObjects(currentAccount!);
      }, 4000);
    } catch (e: any) {
      console.log("error=", e);
      notification.error({
        message: e.toString(),
        placement: "top",
      });
    }
  }, [isConnected, currentAccount]);

  const onRefreshNftsEvent = useCallback(() => {
    refreshObjects(currentAccount!);
  }, [currentAccount]);

  const hasData = isEmpty(nftList);
  const showEmpty = hasData && !loading;
  const showContent = !hasData && !loading;
  return (
    <div className={styles.baseView}>
      <Button className={styles.createButton} onClick={onBuyStone}>
        创建Stone
      </Button>
      {loading && <Spin className={styles.spin} />}
      {showContent && (
        <div className={styles.contentView}>
          {nftList.map((value) => {
            // @ts-ignore
            const { data } = value.details;
            const {
              type,
              fields: {
                name,
                url,
                id: { id },
                attributes,
              },
            } = data as unknown as NftData;
            return (
              <StoneItem
                key={id}
                name={name}
                imageUrl={url}
                id={id}
                type={type}
                suiProvider={suiProviderRef.current}
                attributes={attributes.map((data) => data.fields)}
                onRefreshEvent={onRefreshNftsEvent}
              />
            );
          })}
        </div>
      )}
      {showEmpty && <EmptyPage title="快去创建一个Stone吧" />}
    </div>
  );
}

export default React.memo(NftsSection);
