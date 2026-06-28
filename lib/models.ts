// so that typescript knows the structure of supabase model 
export interface Profile {
    id:             string;
    full_name:      string | null; 
    email:          string | null; 
    avatar_url:     string | null; 
}

export interface Wishlist {
    id:             string; 
    created_at:     string; 
    owner_id:       string; 
    share_token:    string; 
}

export interface WishlistItem {
    id:             string;
    created_at:     string; 
    wishlist_id:    string;
    name:           string; 
    size:           string | null; 
    color:          string | null; 
    price:          number | null; 
    url:            string | null; 
    received:       boolean; 
}

export interface Claims {
    id:             string; 
    item_id:        string; 
    claimer_id:     string; 
    claimed_at:     string; 
    claimer_name:   string; 
}