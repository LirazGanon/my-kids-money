import { createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";
import { HomePage } from "./pages/HomePage";

export const router = createBrowserRouter([
  {
    path: "/my-kids-money/login",
    element: <Login />,
  },
  {
    path: "/my-kids-money/",
    element: <HomePage />,
  },
]);
