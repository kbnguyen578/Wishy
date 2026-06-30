import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export default async function Home() {
  const supabase = await createClient();

  const authResponse = await supabase.auth.getUser(); 
  const user = authResponse.data.user;

  if (user){
    redirect("/dashboard");
  }

  redirect("/login")
}
