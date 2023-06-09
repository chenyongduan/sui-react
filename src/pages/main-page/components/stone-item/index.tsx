import React, { useCallback, useMemo, useState } from "react";
import { Button, Input, Modal, Tooltip, notification } from "antd";
import { useWalletKit } from "@mysten/wallet-kit";
import { JsonRpcProvider, TransactionBlock } from "@mysten/sui.js";
import { checkWalletConnect, fullPriceToSuiPrice } from "qUtils";
import {
  STONE_MARKET_LIST_METHOD,
  STONE_MARKET_MODULE_NAME,
  STONE_PACKAGE_ID,
  STONE_MARKET_SHARE_ID,
  STONE_TYPE,
  SUI_COIN_TYPE,
} from "qConstants";
import ModalStone from "../modal-stone";
import Stone from "../stone";
import styles from "./index.module.less";

type Props = {
  id: string;
  name?: string;
  imageUrl?: string;
  type?: string;
  price?: string;
  listId?: string;
  ownerId?: string;
  attributes: Array<{ name: string; value: string }>;
  suiProvider: JsonRpcProvider;
  onRefreshEvent?: () => void;
};

const getShortId = (id: string) => {
  if (id.length < 10) return id;
  return `${id.slice(0, 6)}...${id.slice(id.length - 4)}`;
};

const NftItem: React.FC<Props> = (props) => {
  const {
    name,
    id,
    imageUrl,
    type,
    attributes,
    price,
    listId,
    ownerId,
    suiProvider,
    onRefreshEvent,
  } = props;
  const { currentAccount, isConnected, signAndExecuteTransactionBlock } =
    useWalletKit();
  const [isModalOpen, setModalOpen] = useState(false);
  const [priceValue, setPriceValue] = useState("100000000");

  const idText = useMemo(() => {
    return getShortId(id);
  }, [id]);

  const realImageUrl = useMemo(() => {
    if (!imageUrl) return;
    if (/http/.test(imageUrl)) {
      return imageUrl;
    }
    return imageUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
  }, [imageUrl]);

  const realType = useMemo(() => {
    if (!type) return;
    const [id, module, nft] = type.split("::");
    return `${getShortId(id)}::${module}::${nft}`;
  }, []);

  const onSellEvent = useCallback(async () => {
    if (!checkWalletConnect(isConnected)) return;
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${STONE_PACKAGE_ID}::${STONE_MARKET_MODULE_NAME}::${STONE_MARKET_LIST_METHOD}`,
        arguments: [
          tx.pure(STONE_MARKET_SHARE_ID),
          tx.pure(id),
          tx.pure(priceValue),
        ],
        typeArguments: [STONE_TYPE],
      });
      await signAndExecuteTransactionBlock({ transactionBlock: tx });
      setTimeout(() => {
        onRefreshEvent?.();
      }, 2000);
    } catch (e: any) {
      console.log("error=", e);
      notification.error({
        message: e.toString(),
        placement: "top",
      });
    }
  }, [isConnected, id, priceValue, onRefreshEvent]);

  const onIdClick = useCallback(() => {
    window.open(`https://explorer.sui.io/object/${id}`, "_blank");
  }, [id]);

  const onSellClick = useCallback(() => {
    setModalOpen(true);
  }, []);

  const handleOk = useCallback(() => {
    onSellEvent();
    setModalOpen(false);
  }, [onSellEvent]);

  const handleCancel = useCallback(() => {
    setModalOpen(false);
  }, []);

  const onInputChange = useCallback((e: any) => {
    setPriceValue(e.target.value);
  }, []);

  const onBuyClick = useCallback(async () => {
    if (!checkWalletConnect(isConnected) || !listId) return;
    try {
      const tx = new TransactionBlock();
      const [coin] = tx.splitCoins(tx.gas, [tx.pure(price)]);
      tx.moveCall({
        target: `${STONE_PACKAGE_ID}::${STONE_MARKET_MODULE_NAME}::purchase_and_take_mut`,
        arguments: [tx.pure(STONE_MARKET_SHARE_ID), tx.pure(listId), coin],
        typeArguments: [STONE_TYPE],
      });
      tx.transferObjects([coin], tx.pure(currentAccount?.address));
      await signAndExecuteTransactionBlock({ transactionBlock: tx });
      setTimeout(() => {
        onRefreshEvent?.();
      }, 2000);
    } catch (e: any) {
      console.log("error=", e);
      notification.error({
        message: e.toString(),
        placement: "top",
      });
    }
  }, [isConnected, listId, onRefreshEvent, price]);

  const onGetBackClick = useCallback(async () => {
    if (!checkWalletConnect(isConnected) || !listId) return;
    try {
      const tx = new TransactionBlock();
      tx.moveCall({
        target: `${STONE_PACKAGE_ID}::${STONE_MARKET_MODULE_NAME}::delist_and_take`,
        arguments: [tx.pure(STONE_MARKET_SHARE_ID), tx.pure(listId)],
        typeArguments: [STONE_TYPE],
      });
      await signAndExecuteTransactionBlock({ transactionBlock: tx });
      setTimeout(() => {
        onRefreshEvent?.();
      }, 2000);
    } catch (e: any) {
      console.log("error=", e);
      notification.error({
        message: e.toString(),
        placement: "top",
      });
    }
  }, [isConnected, listId, onRefreshEvent]);

  const onStoneClick = useCallback(() => {
    ModalStone.show(attributes);
  }, [attributes]);

  const isSelf = ownerId === currentAccount?.address;
  return (
    <div className={styles.baseView}>
      {!!attributes && <Stone attributes={attributes} onClick={onStoneClick} />}
      {!attributes && <img className={styles.image} src={realImageUrl} />}
      <div className={styles.rightView}>
        {!!name && <p>{name}</p>}
        <Tooltip placement="top" title={id}>
          <p className={styles.idText} onClick={onIdClick}>
            {idText}
          </p>
        </Tooltip>
        {!!realType && <p>{realType}</p>}
        {!!price && <p>价格：{fullPriceToSuiPrice(price)}SUI</p>}
        {!price && (
          <Button className={styles.sellButton} onClick={onSellClick}>
            寄售
          </Button>
        )}
        {!!price && !isSelf && (
          <Button className={styles.sellButton} onClick={onBuyClick}>
            购买
          </Button>
        )}
        {!!price && isSelf && (
          <Button className={styles.sellButton} onClick={onGetBackClick}>
            取回
          </Button>
        )}
      </div>
      <Modal
        title="Basic Modal"
        open={isModalOpen}
        onOk={handleOk}
        onCancel={handleCancel}
        cancelText="取消"
        okText="寄售"
      >
        <p>请输入寄售价格</p>
        <Input value={priceValue} onChange={onInputChange} />
      </Modal>
    </div>
  );
};

export default React.memo(NftItem);
