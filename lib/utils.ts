/* 
  PURPOSE: utility func that makes working w/ tailwind css class names cleaner 

  scenario: button red when error, blue default
  w/o cn()
    className={`px-4 py-2 ${isError ? 'bg-red-500' : 'bg-blue-500'}`}
  w/ cn()
    className={cn("px-4 py-2", isError ? "bg-red-500" : "bg-blue-500")}
  + edge cases & conflicts 
*/

// library for conditionally joining class names
// ClassValue = valud input | takes str, obj, arr -> combine into class string 
// filter out falsy values (false, null, undefined)
import { clsx, type ClassValue } from "clsx"

// 2 conflicting Tailwind class, which to choose? 
import { twMerge } from "tailwind-merge"

/* 
  ...inputs | "collect ALL arguments passed to this func into an arr called inputs"
  ClassValue[] | inputs = arr where e/ item = ClassValue
*/
export function cn(...inputs: ClassValue[]) {

  /* 
    clsx | combines ALL inputs into class string 
    twMerge | take combined string & resolve Tailwin conflicts 
  */
  return twMerge(clsx(inputs))
}
