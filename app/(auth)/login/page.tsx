// shadcn Block Code for login page 

import { GalleryVerticalEnd } from "lucide-react"
import { LoginForm } from "@/app/(auth)/login/components/LoginForm"
export default function LoginPage() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-6 bg-muted p-6 md:p-10">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <a href="#" className="flex items-center gap-2 self-center font-medium">
          <img 
            src="/Wishy_Logo.svg"
            alt="Wishy Logo"
            className="h-10 w-auto"
            />
        </a>
        <LoginForm />
      </div>
    </div>
  )
}
