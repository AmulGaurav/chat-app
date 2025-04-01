import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
// import ToastNotification from "../components/ToastNotification";

const AppLayout = () => {
  return (
    <div className="min-h-screen items-center justify-center py-5">
      <Navbar />
      <Outlet />
      {/* <ToastNotification /> */}
    </div>
  );
};

export default AppLayout;
