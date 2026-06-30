/* 
  PURPOSE: contains all auth actions (login, signup, login, logout, google sign-in => server actions)

  AUTH LOGIC = SERVER-SIDE 
    - login logic in browser = security issue (DevTools + Inspect = how auth works)
    - login logic server = auth code invis to user (only see result)
*/

/* 
  Next.js DIRECTIVE -- special instruction strong that must be the very first line of the file 
  
  JOB: tells Next.js "evry func exported from file = server action. run on server ONLY, nvr send code to browser"
  */
"use server";

/*
  tells Next.js to throw away cached version of specific pg & rebuild it fresh on nxt request 
    - after login/signup -> navbar = user specific 
  */
import { revalidatePath } from "next/cache";
/* 
  sends user's browser to diff URL 
    - redirect() -> throws special internal error, Next.js catches & convert to HTTP redirect response 
      - must be called OUTSIDE of try/catch blocks 
      - catch = swallow redirect 
*/
import { redirect } from "next/navigation";

// server-side supabase client -- ALWAYS use server client in server action 
import { createClient } from "@/utils/supabase/server";

/* 
===============================================================
                        Login Function
===============================================================
*/

/* 
  Formdata -- built-in browser/server object 
    - reps data submitted from HTML form
    - ex. email, username, submit -> browser packs fields into FormData to function 
*/
export async function login(formData: FormData) {
  // server-side Supabase client, reads cookies 
  // supabase = "remote control" of database & auth 
  const supabase = await createClient();

  // extract data from FormData 
  const data = {
    // formData.get("email") reads value from form w/ name="email"
    // as string | type casting -> can actually return string | File | null 
    // ⚠️ IN PRODUCTION VALIDATE THIS WITH A LIBRARY (EX. ZOD) ⚠️
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  /* 
    signInWithPassword | sends email & password to Supabase 
      - Supabase checks if user exists & password is correct 
    
    returns {
      data: {user: {...}, 
      session: {...} } 
      error: null
    }

    { error } | destructing ({ } = ), extract the error (what we want) from return object
  */
  const { error } = await supabase.auth.signInWithPassword(data);

  /* 
    if there is an error (wrong pass, user 404, email uncofirmed, etc.)
      -> send user to error page 
    ⚠️ polished app = specify error message ⚠️
  */
  if (error) {
    redirect("/error");
  }

  /* 
    clears cache for entire app layout 
      - "layout" | "revalidate this path AND all pages that use this layout"
      - ensures navbar updates tp show logged-in user's name 
  */
  revalidatePath("/", "layout");
  // send user to homepage now theyre logged in, redirect() = immediate HTTP redirect 
  redirect("/");
}

/* 
===============================================================
                        Signup Function
===============================================================
*/

export async function signup(formData: FormData) {
  const supabase = await createClient();

  // ⚠️ PROD: VALIDATE INPUTS ⚠️ 
  // pull first, last seperate as form has 2 seperate fields 
  const firstName = formData.get("first-name") as string;
  const lastName = formData.get("last-name") as string;

  
  const data = {
    // same as login package 
    email: formData.get("email") as string,
    password: formData.get("password") as string,

    /* 
      options.data = supabase's "user metadata" aka extra info 
        - store alongside auth record (email + pass hash)
        - attached to user's Supabase's auth.users table 
        - accessible via supabase.auth.getUser() 
    */
    options: {
      data: {
        // ` -> allow to embed variables into a string 
        // ${} = JavaScript code 
        full_name: `${firstName + " " + lastName}`,
        email: formData.get("email") as string,
      },
    },
  };

  /* 
    signup creates new user in supabase auth system 
    -> SB sends confirmation email 
    -> user must click link to activate acc 
    -> link leads to route.ts 
  */
  const { error } = await supabase.auth.signUp(data);

  if (error) {
    redirect("/error");
  }

  redirect("/verifyEmail");
}

/* 
===============================================================
                        Signout Function
===============================================================
*/

export async function signout() {
  const supabase = await createClient();

  /* 
    signOut() tells SB to: 
      1. Invaldiate current JWT on server (no longer usable)
      2. clear session cookie from browser 
    any requests that checks session >> no valid token
  */
  const { error } = await supabase.auth.signOut();
  if (error) {
    // prints error in server's terminal -- debugging tool 
    console.log(error);
    //send user to error page for user view 
    redirect("/error");
  }

  // send user to lagout confirmation page
  // ⚠️ CREATE /logout page that says "You've been signed out" ⚠️ 
  redirect("/logout");
}

/* 
===============================================================
                    Sign-In w/ Google Function
===============================================================
*/

export async function signInWithGoogle() {
  const supabase = await createClient();

  /* 
    signInWithOAuth => "OAuth Flow" 
      - standardized 3rd party auth on ur behalf (Google auth)
      - instead of storing a password, trust Google to verify id & report back to app 

    FLOW: 
      1. call function -> supabase gen special google URL 
      2. redirect user to URL (google login page)
      3. user logs in via google acc
      4. google redirect back to app w/ temp code 
      5. supabase exchange code for session & logs user in  
  */
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      queryParams: {
        /* 
          access_type: "offline" requests "refresh token" from Google 
            -> lets SB get new access tokens when curr expires w/o user login again
            -> w/o = session expures ~1 hr permanently 
        */
        access_type: "offline",
        
        /* 
          prompt:"consert" forces Foofle to always show the acc selection screen even when loggedin
            - important for apps w/ multiple goodle accounts 
        */
        prompt: "consent",
      },
    },
  });

  if (error) {
    console.log(error);
    redirect("/error");
  }

  /* 
    data.url = google authentication URL SB generates 
      - immediately redirect user there to login w/ google 
      - after google auth -> google sends user back to app @ callback URL SB handles 
  */
  redirect(data.url);
}