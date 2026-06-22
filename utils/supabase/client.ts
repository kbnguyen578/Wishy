// this file is Supabase connection w/ BROWSER
// use file in any components that user directly interacts (button, forms, clicks, updates
// browser JavaScript can read/write cookies directly 

// client = object w/ methods that allows comms w/ supabase database + auth
// ssr = server side rendering | handles cookies, sessions, auth
import { createBrowserClient } from '@supabase/ssr'

// make function avalable to other files 
export function createClient(){
    // returns supabase client object 
    return createBrowserClient(

        // NEXT_PUBLIC => environemt variables are ALWAYS local, NEXT_PUBLIC makes it available to browser
        // ! => assertion, "i promise this value exists, stop worrying"
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}