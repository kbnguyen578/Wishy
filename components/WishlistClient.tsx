// renders all the UI for updating the wishlist 
"use client";

import { useState, useEffect } from "react";
import { markAsReceived } from "@/lib/wishlist-action";
import ItemPopUp from "./ItemPopup";
import { WishlistItem } from "@/lib/models";

type Props = {
    items: WishlistItem[];
    shareToken: string;
};

export default function WishlistClient({ items, shareToken}: Props) {
    //popUp state 
    const [popUpState, setPopUpState] = useState<"add" | WishlistItem | null>((null));

    // tracks which items is being marked as received 
    const [pendingId, setPendingId] = useState<string | null>(null);

    // tracks if share link was copied -- "Copied!"
    const [copied, setCopied] = useState(false);

    // tracks if component has mounted in the actual browser
    const [orin, setOrigin] = useState("");

    useEffect(function() {
        if (typeof window !== "undefined") {
            setOrigin(window.location.origin);
        }
    }, []);

    // owner marked as received 
    async function handleRecieved( id:string ){
        // show loading 
        setPendingId(id);
        await markAsReceived(id); //function automatically refreshes page 
        //clear loading state 
        setPendingId(null);
    }

    async function copyShareLink(){
        //build the shareable link 
        const shareURL = window.location.origin + "/wishlist/" + shareToken;

        //copy to clipboard
        navigator.clipboard.writeText(shareURL);

        setCopied(true);
        setTimeout(function() {
            setCopied(false);
        }, 2000);
    }

    return(
        <>
            <div className="w-full max-w-2xl flex flex-col gap-4">
                {/* wishlist card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
                    {/* empty state */}
                    {items.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                            <p className="text-sm">Your Wishlist is empty</p>
                            <p className="text-sm">Tap + to add your first item.</p>
                        </div>
                    )}

                    {/* loop through each item and render a ow for it */}
                    {items.map(function(item, index) {
                        return (
                            <div key={item.id}>
                                <div className="flex items-center gap-4 px-6 py-4">
                                    {/* circle for marking recieved */}
                                    <button 
                                        onClick={function() { handleRecieved(item.id); }}
                                        disabled={pendingId === item.id}
                                        aria-label={ "Mark " + item.name + " as received"}
                                        className={
                                            "w-8 h-8 rounded-full border-2 flex-shrink-0 transition-all " +
                                            (pendingId === item.id
                                                ? "border-gray-200 bg-gray-50"
                                                : "border-gray-300 hover:border-gray-900 hover:bg-gray-900/5")
                                        }
                                    />

                                    {/* item info -- clicking this opens editing pop up */}
                                    <button 
                                        onClick={function() {setPopUpState(item); }}
                                        className="flex-1 text-left group"
                                    > 
                                        <p className="text-sm font-medium group-hover:underline underline-offset-2">
                                            {item.name}
                                        </p>

                                        {/* only show details line if size/color exists */}
                                        {(item.size || item.color) && (
                                            <p className="text-xs text-gray-400 mt-0.5 flex gap-3">
                                                {item.size && <span>Size: {item.size}</span>}
                                                {item.color && <span>Color: {item.color}</span>}
                                            </p>
                                        )}
                                    </button>


                                    {/* only show price line if exists */}
                                    {item.price && (
                                        <span className="text-sm text-gray-500 flex-shrink-0">
                                            {item.price}
                                        </span>
                                    )}

                                    {/* only show link icon if exists */}
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
                                            className="text-gray-300 hover:text-gray-600 transition-colors flex-shrink-0 text-lg">
                                                ↗
                                            </a>
                                    )}

                                    {/* divider line between rows  */}
                                    {index < items.length && (
                                        <div className="h-px bg-gray-100 mx-6" />
                                    )}
                                </div>
                            </div>        
                        ); 
                    })}

                    {/* Add button */}
                    <div className="pt-4 px-2">
                        <button 
                            onClick= {function() { setPopUpState("add"); }}
                            aria-label="Add item to wishlist"
                            className="text-3xl text-gray-400 hoever:text-gray-900 transition-colors font-light p-1"
                        >
                        + 
                        </button>
                    </div>
                </div>

                {/* Share Link Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                    <span className="text-sm font-medium text-gray-900 whitespace-nowrap">
                        Your Share Link:
                    </span>

                    {/* capcsule holing link */}
                    <div className="bg=[#F2F2F2] rounded-full px-5 py-2.5 text-sm text-gray-600 flex-1 truncate font-mono">
                        {origin ? origin : "https://wishy.com"}/wishlist/{shareToken}
                    </div>

                    {/* copy button */}
                    <button 
                        onClick={copyShareLink}
                        className="bg-black text-white px-8 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors flex-shrink-0"
                    >
                        {copied ? "Copied!" : "Copy"}
                    </button>
                </div>
            </div>
            {/* pop-up -- rendered only when not null  */}
                {popUpState !== null && (
                    <ItemPopUp 
                        item = {popUpState === "add" ? null: popUpState}
                        onClose={function() {setPopUpState(null); }}
                    />
                )}
        </>
    );

}
