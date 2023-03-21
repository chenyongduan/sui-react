import React, { useCallback, useEffect, useRef, useState } from "react";
import { JsonRpcProvider, devnetConnection } from "@mysten/sui.js";
import { useWalletKit } from "@mysten/wallet-kit";
import { isEmpty } from "underscore";
import { Spin } from "antd";
import StoneItem from "../components/stone-item";
import { STONE_MARKET_SHARE_ID } from "qConstants";
import EmptyPage from "qComponents/empty-page";
import styles from "./index.module.less";

type NftData = {
  url?: string;
  id: string;
  price: string;
  listId?: string;
  ownerId?: string;
  attributes: Array<{
    type: string;
    fields: { name: string; value: string };
  }>;
};

function MarketSection() {
  const { currentAccount } = useWalletKit();
  const suiProviderRef = useRef(new JsonRpcProvider(devnetConnection));
  const [nftList, setNftList] = useState<NftData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentAccount) {
      refreshObjects(true);
    }
  }, [currentAccount]);

  const refreshObjects = async (showLoading?: boolean) => {
    try {
      if (showLoading) setLoading(true);
      const dynamicObjects = await suiProviderRef.current.getDynamicFields(
        STONE_MARKET_SHARE_ID
      );
      if (isEmpty(dynamicObjects.data)) {
        setNftList([]);
        return;
      }
      const listIds = dynamicObjects.data.map((data) => data.objectId);
      const list = await suiProviderRef.current.getObjectBatch(listIds);
      const promiseList = listIds.map(async (id) => {
        return suiProviderRef.current.getDynamicFieldObject(id, "true");
      });
      const listObjects = await Promise.all(promiseList);
      const stoneList = listObjects.map((stone, index) => {
        const {
          attributes,
          id: { id },
          url,
          // @ts-ignore
        } = stone.details.data.fields;
        const {
          price,
          owner,
          id: { id: listId },
          // @ts-ignore
        } = list[index].details.data.fields;
        return {
          attributes,
          id,
          url,
          ownerId: owner,
          listId,
          price: price,
        };
      });
      setNftList(stoneList);
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  const onRefreshMarketsEvent = useCallback(() => {
    refreshObjects(false);
  }, []);

  const hasData = isEmpty(nftList);
  const showEmpty = hasData && !loading;
  const showContent = !hasData && !loading;
  return (
    <div className={styles.baseView}>
      {loading && <Spin className={styles.spin} />}
      {showContent && (
        <div className={styles.contentView}>
          {nftList.map((data) => {
            const { url, id, attributes, price, listId, ownerId } = data;
            return (
              <StoneItem
                key={id}
                imageUrl={url}
                id={id}
                price={price}
                listId={listId}
                ownerId={ownerId}
                suiProvider={suiProviderRef.current}
                attributes={
                  !!attributes && attributes.map((data) => data.fields)
                }
                onRefreshEvent={onRefreshMarketsEvent}
              />
            );
          })}
        </div>
      )}
      {showEmpty && <EmptyPage />}
    </div>
  );
}

export default React.memo(MarketSection);
