import React from "react";
import { BASE_URL, IMAGE_LIST } from "./constants";
import styles from "./index.module.less";

type Props = {
  className?: string;
  attributes: Array<{ name: string; value: string }>;
  onClick?: () => void;
};

const Stone: React.FC<Props> = (props) => {
  const { attributes, onClick, className } = props;

  const getImageUrl = (slotName: string, slotIndex: number) => {
    if (!IMAGE_LIST[slotName] || !IMAGE_LIST[slotName][slotIndex]) return;
    return `${BASE_URL}${slotName}/${IMAGE_LIST[slotName][slotIndex]}`;
  };

  return (
    <div className={`${styles.baseView} ${className}`} onClick={onClick}>
      {attributes.map((data) => {
        const { name, value } = data;
        const imageUrl = getImageUrl(name, Number(value));
        if (imageUrl) {
          return <img key={name} src={imageUrl} draggable={false} />;
        }
      })}
    </div>
  );
};

export default React.memo(Stone);
