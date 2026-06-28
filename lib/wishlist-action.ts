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
    const { data: newWishlist, error } = await supabase.from("wishlist").insert({ owner_id: user }).select().single()

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
    .eq("recieved", false)
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
    .from("wishlists")
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
    const { error } = await supabase.from("wishlist_item").insert({
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

