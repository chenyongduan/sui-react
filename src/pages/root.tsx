import { Button } from "antd";
import { useCallback } from "react";
import { useNavigate } from "react-router-dom";

const RootPage = () => {
  const navigate = useNavigate();

  const onGoToThreePage = useCallback(() => {
    navigate("threePage");
  }, []);

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

      <Button onClick={onGoToThreePage} style={{ marginRight: 20 }}>
        ThreePage
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
