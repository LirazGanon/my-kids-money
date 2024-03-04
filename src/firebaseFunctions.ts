import { db } from "./firebase-config";
import {
  collection,
  query,
  where,
  getDocs,
  DocumentData,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";

interface UserDetails {
  username: string;
  password: string;
  role: number;
  balance?: number;
  transactions: DocumentData[];
}

export interface UserTransaction {
  amount: number;
  date: number;
  from?: string;
  to?: string;
}

export const getUserDetails = async (
  username: string,
  password: string
): Promise<false | UserDetails> => {
  const usersRef = collection(db, "users");
  const q = query(
    usersRef,
    where("username", "==", username),
    where("password", "==", password)
  );
  const querySnapshot = await getDocs(q);

  if (!querySnapshot.empty) {
    const userDoc = querySnapshot.docs[0];
    const userData = userDoc.data();

    // Fetch the transactions for this user
    const transactionsRef = collection(db, `users/${userDoc.id}/transactions`);
    const transactionsSnapshot = await getDocs(transactionsRef);

    const transactions: UserTransaction[] = transactionsSnapshot.docs.map(
      (doc) => doc.data() as UserTransaction
    );

    // Construct the userDetails object
    const userDetails: UserDetails = {
      ...(userData as UserDetails),
      transactions,
    };

    return userDetails;
  } else {
    console.log("No user found with that username.");
    return false;
  }
};

export const updateBalance = async (
  userId: string,
  newBalance: number,
  amount: number,
  user: string,
  type: "from" | "to"
) => {
  // Update the user's balance
  const userRef = doc(db, "users", userId);
  await updateDoc(userRef, {
    balance: newBalance,
  });

  // Add a transaction with the amount (positive for addition, negative for subtraction)
  const transactionRef = collection(db, `users/${userId}/transactions`);
  await addDoc(transactionRef, {
    amount, // Can be positive or negative
    [type]: user,
    date: new Date().getTime(), // Record the current date and time of the transaction
  });
};
