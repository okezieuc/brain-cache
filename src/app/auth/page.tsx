"use client";

import { useState, useContext } from "react";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
  signInWithEmailAndPassword,
} from "firebase/auth";
import firebaseApp from "@/utils/firebase";
import UserContext from "@/utils/userContext";

const auth = getAuth(firebaseApp);

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSignUpPage, setIsSignUpPage] = useState(true);

  const userData = useContext(UserContext);

  function signUp() {
    createUserWithEmailAndPassword(auth, email, password);
  }

  function signIn() {
    signInWithEmailAndPassword(auth, email, password);
  }

  function signOutOfAccount() {
    signOut(auth);
  }

  return (
    <div>
      {userData.user ? "logged in" : "signed out"}
      <div>
        <input
          type="text"
          className="border"
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="border"
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          onClick={() => {
            if (isSignUpPage) {
              signUp();
            } else {
              signIn();
            }
          }}
        >
          {isSignUpPage ? "Sign Up" : "Log In"}
        </button>
      </div>
      <div>
        <button onClick={signOutOfAccount}>Sign out</button>
      </div>
      <div>
        <button onClick={() => setIsSignUpPage(!isSignUpPage)}>
          Click here to {isSignUpPage ? "log in" : "sign up"}
        </button>
      </div>
    </div>
  );
}
