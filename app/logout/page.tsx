// after user lands on this page, they will be redirected in 2 seconds
'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LogoutPage =  () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(()=> router.push("/"), 2000);
    }, []);
  return(
    <main className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center gap-4 px-6">
        <h1 className="text-xl font-medium text-center">You have been logged out. Redirecting...</h1>
    </main>
  );
};

export default LogoutPage;