// page to displayed the shared wishlist

import { createClient } from "@/utils/supabase/server";
import { getSharedWishlist } from "@/lib/wishlist-action";
import { redirect } from "next/navigation";
import Navbar from "@/components/navbar";
import SharedWishlistClient from "@/components/SharedWishlistClient";

// params contina the dynamic URL segments 
type Props = {
    params: Promise<{ token: string }>;
}

export default async function SharedWishlistPage({ params}: Props){
    // await params before reading from it 
    const { token } = await params; 

    const supabase = await createClient(); 

    const authResponse = await supabase.auth.getUser(); 
    const user = authResponse.data.user; 

    // not logged in -> redirect 
    if (!user){
        redirect("/login");
    }

    const result = await getSharedWishlist(token);

    if(!result){
        return(
            <main className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm">This wishlist does not exist or the link is invalid.</p>
            </main>
        );
    }

    // fetch owner's profile so we can see their name @ the top 
    const { data: ownerProfile } = await supabase.from("profiles").select("full_name, avatar_url").eq("id", result.wishlist.owner_id).single();

    // if loggedin user is owner -> redirect to dashboard 
    if(user && user.id=== result.wishlist.owner_id){
        redirect("/dashboard");
    }

    // fetch logged in user profile for nav bar 
    const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single(); 

    return (
        <main className="min-h-screen w-full flex flex-col bg-[#F7F7F7]">
            <Navbar 
                userName={profile?.full_name ?? user.email}
                avatarUrl={profile?.avatar_url}
            />

            <div className="flex flex-col items-center px-8 pt-6 pb-16 gap-4">
                {/* wishlist owner header */}
                <div className="w-full max-w-2xl px-2">
                    <h1 className="text-xl font-medium text-gray-800">
                        {ownerProfile?.full_name ? ownerProfile.full_name + "'s Wishlist" : "Wishlist"}
                    </h1>
                    <p className="text-sm text-gray-400 mt-1">Click an item to claim it as your gift</p>
                </div>

                {/* pass everything to the client component for interactions */}
                <SharedWishlistClient 
                    items={result.items}
                    currentUserId={user.id}
                />
            </div>
        </main>
    );
}
