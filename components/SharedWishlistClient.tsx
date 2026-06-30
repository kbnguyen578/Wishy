// renders all the UI for seeing a friend's wishlist 

"use client"; 

import { useState } from "react";
import { claimItem, unclaimItem } from "@/lib/wishlist-action";
import { WishlistItem } from "@/lib/models";
import { Frown, Link } from "lucide-react";

// extended WishListItem 
type SharedItem = WishlistItem & {
    claimed: boolean; 
    claimedByMe: boolean;
}

type Props = {
    items: SharedItem[]; 
    currentUserId: string;
}; 

export default function SharedWishlistClient({ items, currentUserId }: Props){

    // tracks which item is currently being claimed/unclaimed for loading state
    const [ pendingId, setPendingId ] = useState<string | null>(null);

    // tracks claim changes in this session (UI updates instantly)
    const [ localChanges, setLocalChanges ] = useState<Map<string, boolean>>(new Map());

    // error message -- claiming fails 
    const [ error, setError ] = useState<string | null>(null);

    async function handleClaim(itemId: string){
        // clear prev errors 
        setError(null); 

        // show loading state of item
        setPendingId(itemId);

        try{
            await claimItem(itemId, currentUserId);

            setLocalChanges(function(previous){
                const next = new Map(previous);
                next.set(itemId, true);
                return next;
            }); 
        } catch (err) {
            if (err instanceof Error){
                setError(err.message);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }

        // clear loading state 
        setPendingId(null);
    }

    async function handleUnclaim( itemId: string){
        setError(null);

        setPendingId(itemId);

        try {
            await unclaimItem(itemId);

            setLocalChanges(function(previous){
                const next = new Map(previous);
                next.set(itemId, false); 
                return next;
            }); 
        } catch (err) {
            if (err instanceof Error){
                setError(err.message); 
            } else {
                setError("Something wen wrong. PLease try again.");
            }
        }

         setPendingId(null);
    }

    // if wishlist is empty 
    if(items.length === 0){
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 items-center justify-center py-20 flex flex-col">
                <Frown className="w-5 h-5" strokeWidth={2} />
                <p className="text-sm text-gray-400">This wihslist is empty.</p>
            </div>
        ); 
    }
    
    // items in a wishlist 
    return (
        <div className="w-full max-w-2xl flex flex-col gap-4">

            {/* Error messafe if claiming fails */}
            {error && (
                <div className="bg-red-50 border border-red-100 text-red-500 text-sm px-4 py-3 rounded-xl">
                    {error}
                </div>
            )}

            {/* wishlist card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                {items.map(function(item, index) {
                     const hasLocalChange = item.claimed || localChanges.has(item.id);
                     const claimedByMeNow = hasLocalChange 
                        ? localChanges.get(item.id) 
                        : item.claimedByMe; 
                    
                    const isClaimed = hasLocalChange ? claimedByMeNow === true : item.claimed;

                    const isLoading = pendingId === item.id;

                     const formattedPrice = item.price ? "$" + Number(item.price).toFixed(2) : null; 

                     return(
                        <div key={item.id}>

                            {/* gray out if claimed */}
                            <div className={`flex items-center gap-4 px-6 py-4 ${isClaimed ? "opacity-50" : ""}`}>
                                
                                 {/* claimed badge */}
                                {isClaimed ? (
                                    claimedByMeNow ? (
                                        <button 
                                            onClick={function() { handleUnclaim(item.id); }}
                                            disabled={isLoading}
                                            className={
                                                "text-xs px-3 py-1 rounded-full flex-shrink-0 transition-colors " +
                                                (isLoading
                                                    ? "bg-gray-100 text-gray-400"
                                                    : "bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-500")
                                            }
                                            >
                                                {isLoading ? "Removing..." : "Unclaim"}
                                            </button>
                                    ) : (
                                        // already claimed -- gray badge 
                                    <span className="text-xs bg-gray-100 text-gray-400 px-3 py-1 rounded-full flex-shrink-0">Claimed</span>
                                    )
                                ) : (
                                        // available -- show claim button 
                                    <button 
                                        onClick={function() { handleClaim(item.id); }}
                                        disabled={isLoading}
                                        className={"w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 " +
                                            (localChanges 
                                                ? "border-gray-200 bg-gray-100 cursor-not-allowed" // Claimed state
                                                : isLoading
                                                    ? "border-gray-200 bg-gray-50 animate-pulse" // Loading state
                                                    : "border-gray-300 hover:border-gray-900 hover:bg-gray-900/5 cursor-pointer" // Default interactive state
                                            )
                                        }
                                    >
                                    </button>
                                    )}

                                {/* item info */}
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-800">{item.name}</p>

                                    {(item.size || item.color) && (
                                        <p className="text-xs text-gray-400 mt-0.5 flex gap-3">
                                            {item.size && <span>Size: {item.size}</span>}
                                            {item.color && <span>Color: {item.color}</span>}
                                        </p>
                                    )}
                                </div>

                                {/* price */}
                                {formattedPrice && (
                                    <span className="text-sm text-gray-500 flex-shrink-0 ml-auto">
                                        {formattedPrice}
                                    </span>
                                )}

                                {/* external link */}
                                {item.url && (
                                    <a 
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={"View " + item.name}
                                        onClick={function(e) {
                                            // stop the click from also triggering the row's edit pop up
                                            e.stopPropagation();
                                        }}
                                        className="ml-auto text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0 text-lg">
                                            <Link className="w-5 h-5" strokeWidth={2}/>
                                    </a>
                                )}

                               
                            </div>

                            {/* divider between rows */}
                            {index < items.length && (
                                    <div className="h-px bg-gray-100 mx-6" />
                            )}
                        </div>
                     );
                })}
            </div>
            <p className="text-xs text-gray-400 text-center px-4">The wihslist owner cannot see who has claimed what - it's a surprise!</p>
        </div>
    ); 
}