import { Button } from "antd";
import { useNavigate } from "react-router-dom";

const RootPage = () => {
  const navigate = useNavigate();

  return (
    <div style={{ padding: 40 }}>
      <Button
        onClick={() => {
          navigate("nftPage");
        }}
        style={{ marginRight: 20 }}
      >
        NftPage
      </Button>
      <Button
        onClick={() => {
          navigate("threePage");
        }}
        style={{ marginRight: 20 }}
      >
        ThreePage
      </Button>
      <Button
        onClick={() => {
          navigate("springPage");
        }}
        style={{ marginRight: 20 }}
      >
        SpringPage
      </Button>
      <Button
        onClick={() => {
          navigate("p2Page");
        }}
        style={{ marginRight: 20 }}
      >
        P2Page
      </Button>
    </div>
  );
};

export default RootPage;
