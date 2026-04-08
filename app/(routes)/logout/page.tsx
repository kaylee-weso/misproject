"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { triggerUserRefresh } from "@/lib/hooks/useUser";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function logout() {
      try {
        await fetch("/api/logout", { method: "POST" });
        triggerUserRefresh();
        router.replace("/login"); 
      } catch (err) {
        console.error("Logout failed:", err);
        alert("Logout failed. Please try again.");
      }
    }

    logout();
  }, [router]);

  return <div style={{ padding: "50px" }}>Logging out...</div>;
}