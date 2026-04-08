"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { loginUser } from "@/lib/fetchers/login-logout/login-fetchers";
import { triggerUserRefresh } from "@/lib/hooks/useUser";
import { LoginForm } from "@/components/forms/login/login-form";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginUser(email, password);
      triggerUserRefresh();
      router.push("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      alert("Login failed. Please try again.");
    }
  };

return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center items-center gap-2 md:justify-start">
          <img
            src= "/logo.png"
            alt = "CompanyLogo"
            className="size-12"/>
          <h1 className="flex gap-2 font-medium text-2xl md:text-3xl">Cycle IT</h1>   
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full">
            <LoginForm
              email={email}
              password={password}
              onEmailChange={(val) => setEmail(val)}
              onPasswordChange={(val) => setPassword(val)}
              onLogin={handleLogin}/>
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block">
        <img
          src="/loginpage.jpg"
          alt="Image"
          className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  )
}




