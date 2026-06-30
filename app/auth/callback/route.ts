// for when loggin in with google -> take to dashboard 
import { NextResponse } from "next/server"
import { createClient } from "@/utils/supabase/server"

export async function GET(request: Request){
    const url = new URL(request.url);
    const code = url.searchParams.get("code"); 

    // redirect somewhere specific after login, defaults to dashboard
    const next = url.searchParams.get("next") ?? "/dashboard";

    if (code){
        const supabase = await createClient(); 

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if(!error){
            return NextResponse.redirect(new URL(next, url.origin));
        }
    }

    // if anything goes wrong -> send error page
    return NextResponse.redirect(new URL("/error", url.origin)); 
}