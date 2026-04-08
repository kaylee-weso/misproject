export async function loginUser (email: string, password: string) {
        const res = await fetch("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json"},
            body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
    
        if(!res.ok){
            throw new Error (data.error || "Login failed");
        }
        return data;
    }

export async function getCurrentUser() {
    const res = await fetch ("/api/user");
    const data = await res.json ();
    if (!res.ok) {
        throw new Error (data.error || "Not authenticated");   
    }
    return data;
}


export const logoutUser = async (): Promise<void> => {
  const res = await fetch("/api/logout", { method: "POST" });

  if (!res.ok) {
    throw new Error("Logout failed");
  }
};


        
