/*
JOB: handle supabase session logic, refreshes user's login session on evry pg request
PURPOSE: so users dont get unexpectedly logged out while using 

middleware -- code that runs "in the middle" between user request & app sending 
  "security guard standing @ door checking ID"

  JWT tokens expire after set amt (~1 hr) -> supabase can automatically issue a new one after it expires IF something triggers it 
    - getUser() | on evry request -> supabase can refresh token silently 
*/

/* 
how to get/set/remove cookies from server bc server doesnt have direct browser access 
TypeScript type -- description of what shape and object should have (expiry, secure, httpOnly, etc.)
    - checks youre passing correct type 
*/
import { createServerClient, type CookieOptions } from '@supabase/ssr'

/* 
  NexResponse | object for building HTTP responses in Next.js 
    - methods: .next() (pass thru), .redirect() (send elsewhere), etc.
  NextRequest type -- describes shape of incoming HTTP request, type checking 
*/
import { NextResponse, type NextRequest } from 'next/server'


// handles supabase session logic, exported to ROOT middleware to call 
export async function updateSession(request: NextRequest) {

  /* 
    NextResponse.next() | "dont block or redirect request, let it CONTINUE to actual page normally"
      - variable storage bc MIGHT modify (add cookies) before returning 
    
    let vs const | let = can be reassigned, const != reassigned 
      - cookie set/remove, reassign reponse to fresh object w/ updated cookies 
  */
  let response = NextResponse.next({

    // pass og headers so Next.js can track request context thru middleware chain
    request: {
      headers: request.headers,
    },
  })

  /* 
    Create supabase client tailored for middleware 
      - 3rd client type (client.ts, server.ts, middleware.ts)
      - middlware = unique -> access to RAW request AND response     
  */
  const supabase = createServerClient(
    // tell supabase what project to connect to 
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        /* 
          READ cookies from INCOMING REQUEST 
            - read from raw http request vs. Next.js cookie helper 
        */
        get(name: string) {
          return request.cookies.get(name)?.value
        },

        /* 
          SET cookies on REQUEST AND RESPONSE 
          - JWT refreshed -> new tokens needs to be: 
              1. avaiable for CURRENT request (pg loaded sees updaed session) -> set on request.cookies 
              2. sent back to BROWSER (for future requests to use) -> set on response.cookies 
            w/o both => pg will use old, expired token even tho theres a new one 
        */
        set(name: string, value: string, options: CookieOptions) {
          // update cookie on incoming request -> curr pg sees refreshed session 
          request.cookies.set({
            name,
            value,
            ...options,
          })

          // recreate response object fresh -> ensure response carries latest request headers (incl. updated cookie abv)
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          // set the cookie on response -> browser recieves + store new token for FUTURE requests
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },

        /* 
          same dual-logic for removal: 
            - clear cookie from curr request context AND repsonse sent to browser 
        */
        remove(name: string, options: CookieOptions) {

          // clear request cookie with '' 
          request.cookies.set({
            name,
            value: '',
            ...options,
          })

          // pass modified request headers forward so downstream routes see the change 
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })

          // clear response cookie with '' 
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  /* 
    MOST IMPORTANT LINE !!!!  
    - getUser() does: 
        1. VALIDATES current JWT -- confirms user is who they say they are 
        2. JWT is expried but a valid refresh token exists -> silently issue new JWT & store via set() cookie handler 
        
    - no return user object -> middleware JOB = keep session alive 
    - getUser() | network request to Supabase's servers to validate 
      -> takes time = await 
  */
  await supabase.auth.getUser()

  /* 
    return response (maybe carrying updated session cookie)
    
    Next.js send to browser -> render the page 
   */
  return response
}