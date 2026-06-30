// database logic for wihslist board actions -- adding, editing, marking/claiming 
"use server"; 

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { Wishlist, WishlistItem } from "@/lib/models"; 

// ======== Find/Create Wishlist ========
export async function getOrCreateWishlist(): Promise<Wishlist> {
    const supabase = await createClient(); 

    const authResponse = await supabase.auth.getUser(); 
    const user = authResponse.data.user; 

    // not signed in -> login page
    if (!user) {
        redirect ("/login");
    }

    const { data: existingWishlist } = await supabase.from("wishlist").select("*").eq("owner_id", user.id).single();

    

    // if user already has a wishlist 
    if (existingWishlist){
        return existingWishlist;
    }

    // dont have one = new wishlist 
    const { data: newWishlist, error } = await supabase
    .from("wishlist")
    .insert({ owner_id: user.id })
    .select()
    .single()

    // if something goes wrong...
    if (error){
        throw new Error("Could not create wishlist: " + error.message);
    }

    return newWishlist;
}

// ======== Get Wishlist Items ========
export async function getWishlistItems(wishlistId: string): Promise<WishlistItem[]>{
    const supabase = await createClient(); 

    const { data, error } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("wishlist_id", wishlistId)
    .eq("received", false)
    .order("created_at", { ascending: true }) // oldest displayed first 

    if (error){
        throw new Error("Could not fetch wishlist items: "+error.message);
    }
    
    return data ?? [];
}

// ======== Add Wishlist Items ========
export async function addWishlistItem(formData: FormData){
    const supabase = await createClient(); 

    const authResponse = await supabase.auth.getUser(); 
    const user = authResponse.data.user; 

    if(!user){
        redirect("/login");
    }

    // find user wishlist to attach item to 
    const { data: wishlist, error: wishlistError } = await supabase
    .from("wishlist")
    .select("id")
    .eq("owner_id", user.id)
    .single();

    if( wishlistError || !wishlist){
        throw new Error("Could not find your wishlist.");
    }

    // read values user typed into form 
    const name = formData.get("name") as string;
    const size = ( formData.get("size") as string ) || null; 
    const color = ( formData.get("color") as string) || null; 
    const price = ( formData.get("price") as string) || null; 
    const url = ( formData.get("url") as string) || null; 

    // insert item into database 
    const { error } = await supabase.from("wishlist_items").insert({
        wishlist_id: wishlist.id, 
        name: name, 
        size: size, 
        color: color, 
        price: price,
        url: url, 
        received: false, 
    }); 

    if (error){
        throw new Error("Could not add item: " + error.message);
    }

    // refreshes the page to show new item 
    revalidatePath("/dashboard");
}

// ======== Editing Wishlist Items ========
export async function editWishlistItem( formData: FormData ){
    const supabase = await createClient(); 

    const authResponse = await supabase.auth.getUser(); 
    const user = authResponse.data.user;

    if( !user ){
        redirect("/login");
    }

    const id = formData.get("id") as string; 
    const name = formData.get("name") as string; 
    const size = ( formData.get("size") as string ) || null; 
    const color = ( formData.get("color") as string) || null; 
    const price = ( formData.get("price") as string) || null; 
    const url = ( formData.get("url") as string) || null; 

    // update only the fields the user changed 
    const { error }  = await supabase
    .from("wishlist_items")
    .update({
        name: name, 
        size: size, 
        color: color,
        price: price, 
        url: url, 
    })
    .eq("id", id); // only update the row with this specific id 

    if (error){
        throw new Error("Could not update item:" + error.message);
    }

    revalidatePath("/dashboard")
}

// ======== Mark Item as Recieved/Remove an Item ========
export async function markAsReceived( id: string ){
    const supabase = await createClient(); 

    const authResponse = await supabase.auth.getUser(); 
    const user = authResponse.data.user;

    if( !user ){
        redirect("/login");
    }

    const { error } = await supabase
    .from("wishlist_items")
    .update({ received: true })
    .eq("id", id); // only update this particular item

    if (error){
        throw new Error("Could not mark item as received: " + error.message);
    }

    revalidatePath("/dashboard")

}

// ======== Get Shared Wishlist ========
export async function getSharedWishlist( token: string ){
    const supabase = await createClient(); 

    // find the wishlsit that matches share token 
    const { data: wishlist, error: wishlistError } = await supabase
    .from("wishlist")
    .select("*")
    .eq("share_token", token)
    .single(); 

    // token not match, return null => page not found shown 
    if ( wishlistError || !wishlist ){
        return null; 
    }

    // fetch unrecieved items for this wishlist 
    const { data: items, error: itemsError } = await supabase
    .from("wishlist_items")
    .select("*")
    .eq("wishlist_id", wishlist.id)
    .eq("received", false)
    .order("created_at", { ascending: true });

    if (itemsError){
        throw new Error("Could not fetch items: " + itemsError.message);
    }

    // if there are no items, use an empty array 
    const wishlistItems = items ?? []; 

    // get ids for all the items so we can check which are claimed 
    const itemIds = wishlistItems.map(function(item){
        return item.id;
    });

    // fetch the claims for the items, RLS ensures owner cannot view from share token 
    const { data: claims } = await supabase
    .from("claims")
    .select("item_id")
    .in("item_id", itemIds); 

    // set of claimed items for quick lookup 
    const claimedItemIds = new Set(
        (claims ?? []).map(function(claim){
            return claim.item_id;
        })
    ); 

    // attach claimed boolean to each item so the UI knows what to show 
    const itemsWithClaimStat = wishlistItems.map(function(item){
        return{
            ...item, 
            claimed: claimedItemIds.has(item.id),
        };
    });

    return {
        wishlist: wishlist, 
        items: itemsWithClaimStat,
    }; 
}

// ======== Claiming an Item ========
export async function claimItem ( itemId: string, claimerName: string ){
    const supabase = await createClient(); 

    // check if item has already been claimed by someone else 
    const { data: existingClaim } = await supabase
    .from("claims")
    .select("id")
    .eq("item_id", itemId)
    .maybeSingle();

    if (existingClaim){
        throw new Error("Someone has already claimed this item.")
    }

    const authResponse = await supabase.auth.getUser(); 
    const user = authResponse.data.user;

    if( !user ){
        redirect("/login");
    }

    const { error } = await supabase
    .from("claims")
    .insert({
        item_id: itemId, 
        claimer_name: claimerName, 
        claimer_id: user.id,
    });

    if (error){
        throw new Error("Could not claim item: " + error.message);
    }
}

// ======== UnClaiming an Item ========
export async function unclaimItem( itemId: string ){
    const supabase = await createClient();

    const authResponse = await supabase.auth.getUser();
    const user = authResponse.data.user;

    if(!user){
        redirect("/login")
    }

    // only delete claim if it belongs to the person click ubclaim 
    const { error } = await supabase 
    .from("claims")
    .delete()
    .eq("item_id", itemId) // unclaim only yours 
    .eq("claimer_id", user.id);

    if (error){
        throw new Error("Could not unclaim item: " + error.message);
    }
}