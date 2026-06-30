// main page that fetches and displays everything (server component) -> WishlistClient = client component 
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getOrCreateWishlist, getWishlistItems } from "@/lib/wishlist-action";
import WishlistClient from "@/components/WishlistClient";
import Navbar from "@/components/navbar";

export default async function DashboardPage(){
    const supabase = await createClient();

    // protect the page -- redirect to login if not logged in
    const authResponse = await supabase.auth.getUser(); 
    const user = authResponse.data.user;

    if( !user ){
        redirect("/login");
    }
    
    //fetch user profile for navbar 
    const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single(); 
    
    // get/create user wishlist
    const wishlist = await getOrCreateWishlist();

    const items = await getWishlistItems(wishlist.id);

    return(
        <main className="min-h-screen w-full flex flex-col bg-[#F7F7F7]">
            <Navbar 
                userName={profile?.full_name ?? user.email}
                avatarUrl={profile?.avatar_url}
            />
            <div className="flex justify-center px-4 pt-6 pb-16">
                <WishlistClient
                    items={items ?? []}
                    shareToken={wishlist.share_token}
                />
            </div>
        </main>
    )
    
}