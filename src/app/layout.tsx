"use client";

import { Inter } from "next/font/google";
import "./globals.css";
import { useEffect, useState } from "react";
import UserContext, { AppUser } from "@/utils/userContext";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import firebaseApp from "@/utils/firebase";

const inter = Inter({ subsets: ["latin"] });

const auth = getAuth(firebaseApp);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  useEffect(() => {
    const unsubscriber = onAuthStateChanged(auth, (user) => {
      if (user) {
        // User is signed in
        const uid = user.uid;
        setUser({ uid });
      } else {
        // User is signed out
        setUser(null);
      }
      setLoadingUser(false);
    });

    return () => unsubscriber();
  }, []);

  return (
    <html lang="en">
      <UserContext.Provider value={{ user, loading: loadingUser }}>
        <body className={inter.className}>{children}</body>
      </UserContext.Provider>
    </html>
  );
}
