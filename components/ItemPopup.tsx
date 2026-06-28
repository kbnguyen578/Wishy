// form pop up for adding and editing elements 

"use client";

import { useRef, useEffect } from "react";
import { addWishlistItem, editWishlistItem } from "@/lib/wishlist-action";
import { WishlistItem } from "@/lib/models";

// Props -- tell add (null) or edit (item object) mode, close when done 
type ItemPopUpProps = {
    item: WishlistItem | null; 
    onClose: () => void;
}

export default function ItemPopUp({ item, onClose }: ItemPopUpProps ){
    const isEditing = item !== null; 

    const dialogRef = useRef<HTMLDialogElement>(null); 

    useEffect(function() {
        if (dialogRef.current) {
            dialogRef.current.showModal(); 
        }
    }, []); // [] => only run once, when component mounts

    function handleBackdropClick( e: React.MouseEvent<HTMLDialogElement> ){
        if (e.target === dialogRef.current){
            onClose();
        }
    }

    async function handleSubmit( formData: FormData ){
        if (isEditing){
            await editWishlistItem(formData);
        } else{
            await addWishlistItem(formData);
        } 
        onClose();
    }

    return (
         <dialog ref = {dialogRef} onClick={handleBackdropClick} className="w-full max-w-md rounded-2xl p-0 shadow-xl backdrop:bg-black/30 backdrop:backdrop-blur-sm">
            <div className="p-6"> 

                {/* Header row w/ title & close button */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-medium">
                        {isEditing ? "Edit item" : "Add to wishlist"}
                    </h2>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        aria-label="Close pop-up"
                    >
                    ✕   
                    </button>
                </div>

                {/* The Form itself*/}
                <form action={handleSubmit} className="flex flex-col gap-4">
                    {/* editing only */}
                    {isEditing && (<input type="hidden" name="id" value={item.id} />)}

                    {/* item name - required */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500" htmlFor="name">
                            Item name <span className="text-red-400">*</span>
                        </label>
                        <input 
                            id="name"
                            name="name"
                            type="text"
                            required
                            defaultValue={item?.name ?? ""}
                            placeholder="e.g. Polaroid Camera"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    {/* size and color side by side */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-500" htmlFor="size">
                                Size
                            </label>
                            <input 
                                id="size"
                                name="size"
                                type="text"
                                defaultValue={item?.size ?? ""}
                                placeholder="e.g. M, 4"
                                className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-500" htmlFor="color">
                                Color
                            </label>
                            <input 
                                id="color"
                                name="color"
                                type='text'
                                defaultValue={item?.color ?? ""}
                                placeholder="e.g. Guava Fresca"
                                className="border border-gray-200 rounded-lg px-2 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                            />
                        </div>
                    </div>

                    {/* price */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500" htmlFor="price">
                            Price
                        </label>
                        <input
                            id="price"
                            name="price"
                            type="number"
                            defaultValue={item?.price ?? ""}
                            placeholder="24.99"
                            className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    {/* url */}
                    <div className="flex flex-col gap-1">
                        <label className="text-sm text-gray-500" htmlFor="url">
                            Link
                        </label>
                        <input 
                            id="url"
                            name="url"
                            type="url"
                            defaultValue={item?.url ?? ""}
                            placeholder="https://..."
                            className="border border-gray-200 rounded-lg py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    {/* cancel and submit buttons */}
                    <div className="flex gap-2 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 border border-gray-200 rounded-lg py-2 text-sm hover:bg-gray-50 transition-colors"
                        >Cancel</button>
                        <button 
                            type="submit"
                            className="flex-1 bg-gray-900 text-white rounded-lg py-2 text-sm hoever:bg-gray-700 transition-colors"
                        >{isEditing ? "Save Changes" : "Add Item" }</button>
                    </div>
                </form>
            </div>
         </dialog>
    );
}