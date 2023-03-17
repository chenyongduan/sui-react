import React, { useCallback } from "react";
import styles from "./index.module.less";

type Props = {
  selected?: boolean;
  name: string;
  index: number;
  onChange: (index: number) => void;
};

const Button: React.FC<Props> = (props) => {
  const { selected, name, index, onChange } = props;

  const onChangeEvent = useCallback(() => {
    onChange?.(index);
  }, [index, onChange]);

  return (
    <div
      className={`${styles.baseView} ${selected && styles.viewSelected}`}
      onClick={onChangeEvent}
    >
      <p>{name}</p>
      {selected && <div className={styles.buttonLine} />}
    </div>
  );
};

export default React.memo(Button);
