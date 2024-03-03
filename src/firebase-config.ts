// src/firebase-config.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA6eXqAn7U9JqjLxJHZJoBEle331ldAK_E",
  authDomain: "my-kids-money.firebaseapp.com",
  projectId: "my-kids-money",
  storageBucket: "my-kids-money.appspot.com",
  messagingSenderId: "765540101160",
  appId: "1:765540101160:web:865a1c58a6ef40bfb4591d",
  measurementId: "G-CZG2HZ6LZD",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore
export const db = getFirestore(app);
