"use client";

import {usePathname} from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Gauge, FolderOpen, ClipboardList, Recycle, MapPin } from 'lucide-react';
import {useUser} from "@/lib/hooks/useUser";
import "./navbar.css";




export default function NavBar () {
    const pathname = usePathname();
    const user= useUser();
    
    if (pathname === "/login" || !user || user.role_id !== 1) return null;

    return (
        <aside className= "navbar">
            <div className= "logo">
                <Image src="/logo.png" alt="Company Logo" width={40} height={40}  />
                <h1 className= "text-[25px]">Cycle IT</h1>
            </div>
            <nav className= "navigation">
                <div className= "nav-row dashboard">
                    <div className = "dashboard"> 
                        <button className = "dashboard-icon">
                            <Gauge/>
                        </button>
                        <Link
                            href="/dashboard"
                            className= {pathname === "/dashboard" ? "nav-item active": "nav-item inactive"}
                        >Dashboard
                        </Link>
                    </div>
                </div>
                <div className= "nav-row inventory">
                    <div className = "inventory">
                        <button className = "inventory-icon">
                            <FolderOpen/>
                        </button>
                        <Link
                            href="/inventory"
                            className={pathname === "/inventory" ? "nav-item active" : "nav-item inactive"}
                        >Inventory
                        </Link>
                    </div>
                </div>
                <div className= "nav-row review">
                    <div className ="review">
                        <button className = "review-icon">
                            <ClipboardList/>
                        </button>
                        <Link
                            href="/lifecycle"
                            className={pathname === "/lifecycle" ? "nav-item active" : "nav-item inactive"}
                        >Lifecycle Review
                        </Link>
                    </div>
                </div>
                <div className= "nav-row orderform">
                    <div className ="orderform">
                        <button className = "orderform-icon">
                            <Recycle/>
                        </button>
                        <Link
                            href="/orderform"
                            className={pathname === "/orderform" ? "nav-item active" : "nav-item inactive"}
                        >Recycling Form
                        </Link>
                    </div>
                </div>
                <div className= "nav-row facilitymap">
                    <div  className = "facilitymap">
                        <button className = "facilitymap-icon">
                            <MapPin/>
                        </button>
                        <Link
                            href="/facilitymap"
                            className={pathname === "/facilitymap" ? "nav-item active" : "nav-item inactive"}
                        >
                            Facility Map
                        </Link>
                    </div>
                </div>
            </nav>
        </aside>
    );
}