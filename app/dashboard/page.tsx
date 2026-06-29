// main page that fetches and displays everything (server component) -> WishlistClient = client component 
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getOrCreateWishlist, getWishlistItems } from "@/lib/wishlist-action";
import WishlistClient from "@/components/WishlistClient";

export default async function DashboardPage(){
    const supabase = await createClient();

    // protect the page -- redirect to login if not logged in
    const authResponse = await supabase.auth.getUser(); 
        const user = authResponse.data.user;
    
        if( !user ){
            redirect("/login");
        }
    
    // get/create user wishlist
    const wishlist = await getOrCreateWishlist();

    const items = await getWishlistItems(wishlist.id);

    return(
        <main className="flex justify-center px-4 pt-6 pb-16">
            <WishlistClient
                items={items ?? []}
                shareToken={wishlist.share_token}
            />
        </main>
    )
    
}