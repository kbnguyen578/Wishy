// navbar compnent to use across pages 
"use client";

import { User, LogOut } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { signout } from "@/lib/auth-actions";

type NavbarProps = {
    userName ?: string | null;
    avatarUrl?: string | null; 
};

export default function Navbar({ userName, avatarUrl }: NavbarProps){
    // showcase intial from email if exists 
    const initial = userName?.trim()?.[0]?.toUpperCase(); 

    // is dropdown menu open 
    const [ isOpen, setIsOpen ] = useState(false);

    // ref to dropdown wrapper, used to detect outside clicks 
    const dropdownRef = useRef<HTMLDivElement>(null); 

    // close the dropdown when click outside 
    useEffect(function() {
        function handleClickOutside(event: MouseEvent){
            if( 
                dropdownRef.current && !dropdownRef.current.contains(event.target as Node)
            ) {
                setIsOpen(false);
            }
        }

        // listens for click anywhere on page 
        document.addEventListener("mousedown", handleClickOutside);

        // stop listening when component unmounts 
        return function() {
            document.removeEventListener("mousedown", handleClickOutside);
        }; 
    }, []); 

    return (
        <nav className="w-full bg-[#F7F7F7] flex items-center justify-between px-18 py-6">
            {/* wishy logo */}
            <img 
            src="/Wishy_Logo.svg"
            alt="Wishy Logo"
            className="h-15 w-auto"
            />
        
            {/* profile bubble + dropdown menu */}
            <div className="relative" ref={dropdownRef}>
                <button
                    onClick={function() { setIsOpen(!isOpen); }}
                    aria-label="Open profile menu"
                    className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium flex-shrink-0 overflow-hidden shadow-sm border border-gray-200/50">
                        {avatarUrl ? (
                            <img 
                                src={avatarUrl}
                                alt={userName ? `${userName}'s avatar` : "User avatar"}
                                className="w-full h-full object-cover" // prevents stretching
                            />
                        ) : initial ? (
                            <span>{initial}</span>
                        ) : (
                            < User className="w-5 h-5 text-gray-200" strokeWidth={2}/>
                        )}
                </button>

                {/* drop down menu */}
                {isOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                        {/* user name shown @ top of dropdown */}
                        { userName && (
                            <div className="px-4 py-2 border-b border-gray-100">
                                <p className="text-sm font-medium text-gray-800 truncate">{userName}</p>
                            </div>
                        )}

                        {/* link to edit profile */}
                        <a 
                            href="/profile"
                            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 gover:bg-gray-50 transition-colors"
                        >
                            <User className="w-4 h-4" strokeWidth={2}/>
                            Edit Profile
                        </a>

                        {/* logout button */}
                        <form action={signout}>
                            <button 
                                type="submit"
                                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 transition-colors text-left">
                                    <LogOut className="w-4 h-4" strokeWidth={2}/>
                                    Log out                
                                </button>
                        </form>
                    </div>
                )}
            </div>

        </nav>
    );
} 
