// navbar compnent to use across pages 

import { User } from "lucide-react";

type NavbarProps = {
    userName ?: string | null;
    avatarUrl?: string | null; 
};

export default function Navbar({ userName, avatarUrl }: NavbarProps){
    // showcase intial from email if exists 
    const initial = userName?.trim()?.[0]?.toUpperCase(); 

    return (
        <nav className="w-full bg-[#F7F7F7] flex items-center justify-between px-18 py-6">
            {/* wishy logo */}
            <img 
            src="/Wishy_Logo.svg"
            alt="Wishy Logo"
            className="h-15 w-auto"
            />
        
            {/* profile bubble */}
            <div className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center text-sm font-medium flex-shrink-0 overflow-hidden shadow-sm border border-gray-200/50">
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
            </div>
        </nav>
    );
} 
