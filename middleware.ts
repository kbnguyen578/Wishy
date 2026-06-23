/*
  BASE OF PROJECT -- Next.js official middleware entry point 
    - Next.js runs this @ EVERY request before page loads 
    - "front door to app"
    - dif from utils/supabase/middleware.ts -> "SEPERATION OF CONCERNS"
      - seperation of concerns | breaking a complex software sys into distinct, indepenet modules 

  JOB: intercept requests & decide what to do 
*/

// type NextRequest -- type checking, Next.js request object 
import { type NextRequest } from 'next/server'
/*
  updateSession from Supabase middleware utility 
  @/ -- path alias, shortend path to .../utils/supabase/middleware 
*/
import { updateSession } from '@/utils/supabase/middleware'
/* 
  functioned named exactly "middleware" exported to a file named "middleware.ts"
    => AUTOMATICALLY detecte+ run by Next.js on evry request 
*/

/* 
  updateSession = asynch => middlware = asynch too 
    job: awaits network call to refresh Supabase session 
*/
export async function middleware(request: NextRequest) {

  /* 
    handles JWT refresh logic, returns (possibly modified) response
      - await bc we need complete session refresh before response sent back 
  */
  return await updateSession(request)
}

/* 
  config = what route to send middleware on 
    -> no config = run on EVERY request = wasteful 
*/
export const config = {
  // arry of URL patterns | middleware only run on requests of URL that matches a pattern 
  matcher: [
    // regular expression (regex) -- pattern marching langauge 
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    /* 
      /(...).*      | match any path 
      (?! ... )     | EXCEPT path that starts w/ what's inside 
      _next/static  | Next.js's compiled CSS, JS, & other build files 
      _next/image   | Next.js's image optimization service URLs 
      favicon.ico   | little icon on brower tabs 
      .*\\.(?:svg|png|jpg|jpeg|gif|webp)$ 
                    | any URL ending in image file extension
      
      TLDR: "run middleware on every URL EXCEPT statis assets & images"

    */
  ],
}