
import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAraInC4_-hRlU4o5bt15mSc4Z3FnduAl4",
  authDomain: "attendancemanagementsyst-86eca.firebaseapp.com",
  projectId: "attendancemanagementsyst-86eca",
  storageBucket: "attendancemanagementsyst-86eca.appspot.com",
  messagingSenderId: "15634336598",
  appId: "1:15634336598:web:03111deeb6eccb302ca4f7"
};

// Initialize Firebase

export const app =!getApps().length? initializeApp(firebaseConfig):getApp();
export const db=getFirestore(app);
