import ReactDOM from "react-dom";
import Stone from "../stone";
import styles from "./index.module.less";

class ModalStone {
  alterNode?: HTMLDivElement;
  tag?: string;
  show(
    attributes: Array<{ name: string; value: string }>,
    zIndex?: number,
    tag?: string
  ) {
    this.remove();
    this.tag = tag;
    const div = document.createElement("div");
    div.setAttribute("class", styles.baseView);
    div.addEventListener("click", this.remove);
    if (zIndex !== undefined) {
      div.setAttribute("style", `z-index:${zIndex};`);
    }
    ReactDOM.render(
      <Stone attributes={attributes} className={styles.stone} />,
      div
    );
    document.body.appendChild(div);
    this.alterNode = div;
  }
  remove = () => {
    if (this.alterNode) {
      document.body.removeChild(this.alterNode);
      this.alterNode = undefined;
      this.tag = undefined;
    }
  };
}

export default new ModalStone();
