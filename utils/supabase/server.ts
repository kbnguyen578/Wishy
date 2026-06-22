/* 
file is used as Supabase connection w/ SERVER 
server actions, compnents, API routes 
server has to read cookies from HTTP request -> write to HTTP repsonse 
login = cookie 
*/ 

/* 
how to get/set/remove cookies from server bc server doesnt have direct browser access 
TypeScript type -- description of what shape and object should have (expiry, secure, httpOnly, etc.)
    - checks youre passing correct type 
*/
import { createServerClient, type CookieOptions } from '@supabase/ssr'
// Next.js helper, access to browser cookie from server 
import { cookies } from 'next/headers'

/* 
async = function that contains "asychronous" operations -- unknown time to complete 
    - ALWAYS return a PROMISE (placeholder for value will arrive in future)
    - server is asynch bc Next.js heler has to fetch vs. browser having access directly 
*/
export async function createClient(){

    /* 
     await = pauses until cookies() finish and returns 
        - w/o = promise => useless 
        - ONLY USABLE IN ASYNCH function 
    */
    const cookieStore = await cookies()

    // return server client directly (const supabase = await createClient())
    return createServerClient(

        // tell supabase what project to connect to 
        process.env.NEXT_PUBLIC_SUPABASE_URL!, 
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, 
        {
            // confirguration object -- set of instructions telling supabase how to handle cookies in server env. 
                // TLDR : teaching supabase how to use Next.js cookie system 
            cookies: {

                // get: called by supabase when it needs to READ cookies (ex. checking if logged in, reads cookie + find JWT)
                get(name:   string){
                    /*
                    returns {value: "..."} or undefined if DNE
                    ? = optional chaining | if get(name) = undefined, it stops and return undefiend there 
                        - continuing to .value undefined = crashing w/ "cannot read 'value" of undef"
                        - JWT = JSON web token | browser cookie for user auth 
                    */
                    return cookieStore.get(name)?.value
                }, 

                /*
                set: called by supabase when it needsw to WRITE a cookie (ex. after login, SB saves JWT session as cookie)
                
                */
                set(name: string, value: string, options: CookieOptions){

                    /* 
                    why try/catch? -- Next.js server components = "read-only" 
                        -> some rendering context = not allowed to set cookies bc response has been partially sent 
                        - catch prevents app creashing, catches it and moves on 
                    */
                    try{
                        cookieStore.set({ name, value, ...options })
                    } catch (error){
                        // empty bc we do not need to handle error 
                    }
                }, 

                // remove: called by supabase when a cookie needs to be DELETED (ex. logout - SB clears session)
                remove(name: string, options: CookieOptions){
                    try {
                        /* 
                        value: '' vs delete | HTTP cookie can nvr actually be deleted, only OVERWRITE w/ empty val + set expiry to the past 
                        ...options -- "spread" syntax | object w/ cookie settings & unpacks settings into .set() call 
                        */
                        cookieStore.set({ name, value: '', ...options })
                    } catch (error) {}
                }, 
            },
        }
    )
}