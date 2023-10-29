"use client";

import { createContext } from "react";

export type AppUser = {
  uid: string;
};

const UserContext = createContext<{ user: AppUser | null; loading: boolean }>({
  loading: true,
  user: null,
});

export default UserContext;
