import { useState, useEffect } from "react";
import { getCurrentUser } from "@/lib/fetchers/login-logout/login-fetchers";

export type UserData = {
  user_id: number;
  role_id: number;
  firstname: string;
  lastname: string;
  initials: string;
};


let userVersion = 0;           
const listeners: (() => void)[] = [];

export function triggerUserRefresh() {
  userVersion++;
  listeners.forEach((fn) => fn());
}


export function useUser() {
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchUser() {
      try {
        const data = await getCurrentUser();
        if (!cancelled) setUser(data);
      } catch {
        if (!cancelled) setUser(null);
      }
    }

    fetchUser();

    const listener = () => fetchUser();
    listeners.push(listener);

    return () => {
      cancelled = true;
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  }, []);

  return user;
}