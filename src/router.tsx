import { Route, createBrowserRouter } from "react-router-dom";
import { Login } from "./pages/Login";

export const router = createBrowserRouter([
  {
    path: "",
    element: <Route path="login" element={<Login />} />,
  },
  {
    path: "home",
    element: <div>Logged in</div>,
  },
]);
