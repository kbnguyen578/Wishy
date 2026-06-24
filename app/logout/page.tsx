// after user lands on this page, they will be redirected in 2 seconds
'use client';
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const LogoutPage =  () => {
    const router = useRouter();
    useEffect(() => {
        setTimeout(()=> router.push("/"), 2000);
    }, []);
  return <div>You have logged out... redirecting in a sec.</div>;
};

export default LogoutPage;