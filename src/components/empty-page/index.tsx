import React from "react";
import PIC_LOGO from "./images/logo.png";
import styles from "./index.module.less";

type Props = {
  title?: string;
};

const EmptyPage: React.FC<Props> = (props) => {
  const { title } = props;

  return (
    <div className={styles.baseView}>
      <img src={PIC_LOGO} className={styles.image}></img>
      <p className={styles.title}>{title || "暂无数据"}</p>
    </div>
  );
};

export default React.memo(EmptyPage);
