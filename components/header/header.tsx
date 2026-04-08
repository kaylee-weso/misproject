"use client";
import { BellIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { useUser, triggerUserRefresh } from "@/lib/hooks/useUser";
import { logoutUser } from "@/lib/fetchers/login-logout/login-fetchers";
import { useLifecycleCounts } from "@/lib/service/lifecyclecounts-context";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
} from "@/components/ui/popover";
import "./header.css";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const user = useUser();
  const { counts } = useLifecycleCounts();

  if (pathname === "/login" || !user) return null;

  const handleLogout = async () => {
    try {
      await logoutUser();
      triggerUserRefresh();
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed:", err);
      alert("Logout failed. Please try again.");
    }
  };

  const handleCategoryClick = (category: "upcoming" | "today" | "past") => {
    router.push(`/lifecycle?category=${category}`);
  };

  const totalCount = counts.upcoming + counts.today + counts.past;

  return (
    <header className="header">
      <div className="left-side">
        <Popover>
          <PopoverTrigger asChild>
            <button className="bell-button circle-icon" aria-label="Notifications">
              <BellIcon className="bell-icon" />
              {totalCount > 0 && <span className="badge">{totalCount}</span>}
            </button>
          </PopoverTrigger>

          <PopoverContent side="bottom" align="end">
            <PopoverHeader>
              <PopoverTitle className = "p-2 text-lg font-semibold">Lifecycle Reviews</PopoverTitle>
            </PopoverHeader>
            <div className="flex flex-col gap-2.5">
              <div className="dropdown-item cursor-pointer" onClick={() => handleCategoryClick("upcoming")}>
                Upcoming: {counts.upcoming}
              </div>
              <div className="dropdown-item cursor-pointer" onClick={() => handleCategoryClick("today")}>
                Today: {counts.today}
              </div>
              <div className="dropdown-item cursor-pointer" onClick={() => handleCategoryClick("past")}>
                Past: {counts.past}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="right-side">
        <div className="circle-icon">{user.initials}</div>
        <div className="signout">
          <button className="signout-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}