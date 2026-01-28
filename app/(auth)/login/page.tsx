import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <div className="dark grid min-h-svh lg:grid-cols-2">
      <div className="relative flex flex-col gap-4 p-6 md:p-10 bg-[#0a0a0a]">
        {/* Gradient overlay on the right edge */}
        <div className="absolute top-0 right-0 bottom-0 w-32 bg-gradient-to-l from-transparent via-[#0a0a0a]/50 to-[#0a0a0a] pointer-events-none hidden lg:block z-10" />

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            {/* Logo ve başlık */}
            <div className="flex flex-col items-center gap-4 mb-8">
              <img
                src="/logo.png"
                alt="ALTAY"
                className="h-16 w-auto"
              />
              <div className="text-center">
                <h1 className="text-2xl font-bold mb-1 text-white">ALTAY</h1>
                <p className="text-sm text-gray-400">Analiz Listeleme ve Takip Yönetimi</p>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold text-white">Yükleniyor...</h1>
                  </div>
                </div>
              }
            >
              <LoginFormWrapper />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="relative hidden lg:block overflow-hidden">
        {/* Görsel */}
        <img
          src="/login.jpg"
          alt="ALTAY"
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Sol taraftan gelen gradient efekt */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" style={{ width: '30%' }} />
      </div>
    </div>
  )
}
