import {
  Box,
  Container,
  Typography,
  Button,
  Slider,
  CircularProgress,
} from "@mui/material";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import {
  UserTransaction,
  getUserDetails,
  updateBalance,
} from "../firebaseFunctions";
import {
  collection,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
} from "firebase/firestore";
import { db } from "../firebase-config";

import maleLogo from "../assets/man-user-circle-icon.svg";
import femaleLogo from "../assets/woman-user-circle-icon.svg";

const getHebName = (name: string | undefined) => {
  switch (name) {
    case "ariel":
      return "אריאל";
    case "papa":
      return "אבא";

    default:
      return "אמא";
  }
};
const getIcon = (name: string | undefined) => {
  switch (name) {
    case "papa":
      return maleLogo;

    default:
      return femaleLogo;
  }
};

export const HomePage: React.FC = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>();
  const [role, setRole] = useState<number>();
  const [balance, setBalance] = useState<number>();
  const [value, setValue] = useState(0);
  const [transactions, setTransactions] = useState<UserTransaction[]>();
  const [transferTo, setTransferTo] = useState<"papa" | "mama">();

  useEffect(() => {
    checkIsLoggedIn().then(() => {
      const unsubscribeBalance = listenToArielBalance();
      const unsubscribeTransactions = listenToArielTransactions();

      return () => {
        unsubscribeBalance();
        unsubscribeTransactions();
      };
    });
  }, []);

  const listenToArielBalance = () => {
    const docRef = doc(db, "users", "ariel");
    return onSnapshot(
      docRef,
      (doc) => {
        if (doc.exists()) {
          const userData = doc.data();
          setBalance(userData.balance); // Assuming the balance field is directly on Ariel's user document
        }
      },
      (error) => {
        console.error("Failed to listen to Ariel's balance:", error);
      }
    );
  };

  const listenToArielTransactions = () => {
    const q = query(
      collection(db, "users/ariel/transactions"),
      orderBy("date", "desc"),
      limit(5)
    );
    return onSnapshot(
      q,
      (querySnapshot) => {
        const transactionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as UserTransaction),
        }));
        setTransactions(transactionsData);
      },
      (error) => {
        console.error("Failed to listen to Ariel's transactions:", error);
      }
    );
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const checkIsLoggedIn = async () => {
    setLoading(true);
    const user = localStorage.getItem("user");
    if (user) {
      const [username, password] = user.split("@");
      const userDoc = await getUserDetails(username, password);
      if (userDoc) {
        console.log("User is logged in.");
        setUserName(userDoc.username);
        setRole(userDoc.role);
        if (userDoc.role === 1) {
          const arielDoc = await getUserDetails("ariel", "1234");
          arielDoc && setBalance(arielDoc.balance);
        } else {
          setBalance(userDoc.balance);
        }

        const transactionsRef = collection(db, "users/ariel/transactions");
        const q = query(transactionsRef, orderBy("date", "desc"), limit(5)); // Adjust as needed
        const querySnapshot = await getDocs(q);
        const transactionsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as UserTransaction),
        }));
        setTransactions(transactionsData);

        setLoading(false);
      } else {
        console.log("User Details incorrect.");

        handleLogout();
      }
    } else {
      console.log("User is not logged in.");

      handleLogout();
    }
  };

  const isAdmin = useMemo(() => role === 1, [role]);

  const handleSliderChange = (_event: Event, newValue: number | number[]) => {
    // Since you're using the slider for a single value, newValue should be a number, not an array
    // However, to satisfy TypeScript, you might still need to check its type
    if (typeof newValue === "number") {
      setValue(newValue);
    }
  };

  const handleUpdateBalance = async (type: "from" | "to") => {
    setLoading(true); // Start loading
    const newBalance = (balance || 0) + value;
    await updateBalance(
      "ariel",
      newBalance,
      value,
      transferTo || userName || "papa",
      type
    );
    // Assuming updateBalance function is now also returning the updated balance,
    // otherwise, you might need to fetch the updated balance separately.
    setBalance(newBalance); // Update the balance state
    setLoading(false); // Done loading
  };

  if (!userName) {
    return (
      <Box
        sx={{
          display: "flex",
          position: "fixed",
          right: "0",
          top: "0",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          width: "100%",
          background: "#ffffffdd",
          zIndex: "9999",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleIncrement = () => {
    setValue((prevValue) => Math.min(prevValue + 1, isAdmin ? 100 : 0)); // Ensure value does not exceed max based on isAdmin
  };

  const handleDecrement = () => {
    setValue((prevValue) => Math.max(prevValue - 1, -100)); // Ensure value does not go below min
  };

  const getContent = () => {
    return (
      <Box onClick={() => setTransferTo(undefined)}>
        <Box sx={{ p: 2, background: "#333b9b" }}>
          <Button
            color="inherit"
            sx={{ color: "#8d8d8d" }}
            onClick={handleLogout}
          >
            התנתק
          </Button>
          <Typography color="#f7f7f7" variant="h4" component="h1" gutterBottom>
            היי {getHebName(userName)}!
          </Typography>
          <Typography variant="body1" color="#f7f7f7">
            {isAdmin ? "היתרה של אריאל:" : "יש לך:"}
          </Typography>
          <Typography variant="h2" color="#e8fff9" fontWeight={600}>
            {balance}
            <Typography component={"span"} variant="h4">
              ₪
            </Typography>
          </Typography>
        </Box>
        <Box
          onClick={() => setTransferTo(undefined)}
          sx={{
            padding: "10px 25px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
          }}
        >
          <Slider
            value={value}
            min={-100} // Adjust as needed
            max={isAdmin ? 100 : 0} // Adjust as needed
            onChange={handleSliderChange}
            aria-labelledby="input-slider"
          />
          <Typography variant="body2">כמה להעביר?</Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              m: "auto",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleIncrement}
              disabled={value === (isAdmin ? 100 : 0)}
              sx={{
                borderRadius: "50%", // Makes the button rounded
                borderColor: "green",
                color: "green",
                minWidth: "20px", // Ensures the button is circular even with small content
                height: "20px", // Makes the button circular
                fontWeight: "bold", // Makes the "+" symbol bolder
                p: 0,
                borderWidth: 2,
              }}
            >
              +
            </Button>
            <Typography variant="h4" dir="ltr" component="span">
              {value}
              <Typography component="span">₪</Typography>
            </Typography>
            <Button
              variant="outlined"
              onClick={handleDecrement}
              disabled={value === -100}
              sx={{
                borderRadius: "50%", // Makes the button rounded
                borderColor: "red",
                color: "red",
                minWidth: "20px", // Ensures the button is circular even with small content
                height: "20px", // Makes the button circular
                fontWeight: "bold", // Makes the "-" symbol bolder
                p: 0,
                borderWidth: 2,
              }}
            >
              –
            </Button>
          </Box>

          {!isAdmin && (
            <div>
              <img
                src={maleLogo}
                className="logo"
                alt="maleLogo logo"
                onClick={(e) => {
                  e.stopPropagation();
                  setTransferTo("papa");
                }}
              />
              <img
                src={femaleLogo}
                className="logo"
                alt="femaleLogo logo"
                onClick={(e) => {
                  e.stopPropagation();
                  setTransferTo("mama");
                }}
              />
            </div>
          )}
        </Box>
        <Button
          variant="contained"
          color="primary"
          disabled={!isAdmin && !transferTo}
          onClick={() => handleUpdateBalance(isAdmin ? "from" : "to")}
          sx={{ m: 2 }}
        >
          עדכון יתרה
        </Button>
      </Box>
    );
  };

  return (
    <Container component="main" dir="rtl" sx={{ p: 0 }}>
      {loading && (
        <Box
          sx={{
            display: "flex",
            position: "fixed",
            right: "0",
            top: "0",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
            width: "100%",
            background: "#ffffffdd",
            zIndex: "9999",
          }}
        >
          <CircularProgress />
        </Box>
      )}

      {getContent()}

      {transactions && (
        <Box sx={{ backgroundColor: "#b9dcff22", padding: "5px 20px 20px" }}>
          <Typography
            variant="h6"
            sx={{
              margin: 2,
              textAlign: "center",
              fontWeight: "medium",
              fontSize: "1.25rem",
              color: "#333",
            }}
          >
            תנועות אחרונות
          </Typography>
          {transactions.map((transaction) => (
            <Box
              key={transaction.date}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: transaction.amount > 0 ? "#42ff9f" : "#ffa7a7",
                p: 2,
                marginBlock: "15px",
                borderRadius: "10px",
                boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.11)",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  gap: "5px",
                  alignItems: "center",
                  justifyContent: "end",
                  minWidth: "65px",
                }}
              >
                <Typography sx={{ fontSize: "0.9rem", fontWeight: "600" }}>
                  {transaction.from ? "מ" : "אל"}
                </Typography>
                <img
                  src={getIcon(transaction.from || transaction.to)}
                  height={40}
                  width={40}
                  alt=""
                />
              </Box>
              <Typography dir="ltr" sx={{ fontWeight: "600" }}>
                {transaction.amount}₪
              </Typography>
              <div>
                {new Date(transaction.date)
                  .toLocaleDateString("he-IL", {
                    weekday: "short",
                    month: "numeric",
                    day: "numeric",
                  })
                  .replace(".", "/")}
              </div>
            </Box>
          ))}
        </Box>
      )}
    </Container>
  );
};
