// page display to tell users to verify email 

import { Mail } from "lucide-react"

export default function VerifyEmailPage(){
    return(
        <main className="min-h-screen bg-[#F7F7F7] flex flex-col items-center justify-center gap-4 px-6">
            <Mail className="w-5 h-5" strokeWidth={2} />
            <h1 className="text-xl font-medium text-gray-500 text-center">Verify your account</h1>
            <p className="text-sm text-gray-500 text-center max-w-sm">
                We sent a confirmation link to your email. Click it to verify your account, then come back here and log in.
            </p>
            <a href="/login" className="text-sm bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-700 trasnition-colors mt-2">
                Back to Login
            </a>
        </main>
    );
}