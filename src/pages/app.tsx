import { Routes, Route, Outlet } from "react-router-dom";
import HomePage from "./main-page";
import RootPage from "./root";
import ThreePage from "./three-page";
import P2Page from "./p2-page";
import SpringPage from "./spring-page";

const App = () => {
  return (
    <Routes>
      <Route path="/" element={<Outlet />}>
        <Route index element={<RootPage />} />
        <Route path="nftPage" element={<HomePage />} />
        <Route path="threePage" element={<ThreePage />} />
        <Route path="springPage" element={<SpringPage />} />
        <Route path="p2Page" element={<P2Page />} />
      </Route>
    </Routes>
  );
};

export default App;
