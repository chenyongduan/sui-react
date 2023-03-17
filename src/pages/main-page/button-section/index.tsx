import React from "react";
import Button from "./button";
import styles from "./index.module.less";

type Props = {
  selectId: number;
  data: Array<{ name: string }>;
  onChange: (index: number) => void;
};

const ButtonSection: React.FC<Props> = (props) => {
  const { selectId, data, onChange } = props;

  return (
    <div className={styles.baseView}>
      {data.map((v, index) => {
        const { name } = v;
        return (
          <Button
            key={index}
            selected={index === selectId}
            name={name}
            index={index}
            onChange={onChange}
          />
        );
      })}
    </div>
  );
};

export default React.memo(ButtonSection);
