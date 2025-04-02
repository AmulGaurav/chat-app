import { Outlet } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Toaster } from "@/components/ui/sonner";

const AppLayout = () => {
  return (
    <div className="min-h-screen items-center justify-center py-5">
      <Navbar />
      <Outlet />
      <Toaster closeButton />
    </div>
  );
};

export default AppLayout;
