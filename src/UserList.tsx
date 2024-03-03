import React, { useEffect, useState } from "react";
import { db } from "./firebase-config";
import { collection, getDocs } from "firebase/firestore";

interface User {
  id: string;
  username?: string; // Assuming you have a username field, make it optional if it might not exist
  role: number; // Similarly, make it optional if it might not exist
  balance?: number;
  // Add any other fields you expect to have in your user objects
}

export const UsersList = () => {
  // Define the state with the User type
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const getUsers = async () => {
      const usersCollectionRef = collection(db, "users");
      const data = await getDocs(usersCollectionRef);
      setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id } as User)));
    };

    getUsers();
  }, []);

  return (
    <div>
      <h2>Users</h2>
      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.username} - Role: {user.role} | balance :
            {user.balance ?? "infinity"}
          </li>
        ))}
      </ul>
    </div>
  );
};
