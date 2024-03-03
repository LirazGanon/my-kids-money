import { FC, useEffect } from "react";
import "./App.css";
import { Login, checkUserExists } from "./pages/Login";

const App: FC = () => {
  useEffect(() => {
    checkIsLoggedIn();
  }, []);

  const checkIsLoggedIn = async () => {
    const username = localStorage.getItem("username");
    const password = localStorage.getItem("password");

    if (username && password) {
      const isLogged = await checkUserExists(username, password);
      if (isLogged) {
        console.log("User is logged in.");
      }
    } else {
      console.log("User is not logged in.");
    }
  };
  return (
    <>
      <Login />
      {/* <UsersList /> */}
    </>
  );
};

export default App;
