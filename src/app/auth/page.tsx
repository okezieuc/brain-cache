"use client";

import { useState } from "react";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import firebaseApp from "@/utils/firebase";

const auth = getAuth(firebaseApp);

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isSignUpPage, setIsSignUpPage] = useState(true);

  function signUp() {
    createUserWithEmailAndPassword(auth, email, password);
  }

  return (
    <div>
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
            }
          }}
        >
          {isSignUpPage ? "Sign Up" : "Log In"}
        </button>
      </div>
      <div>
        <button onClick={() => setIsSignUpPage(!isSignUpPage)}>
          Click here to {isSignUpPage ? "log in" : "sign up"}
        </button>
      </div>
    </div>
  );
}
