import { Suspense } from "react"
import { LoginForm } from "@/components/login-form"

function LoginFormWrapper() {
  return <LoginForm />
}

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md text-sm font-bold">
              B
            </div>
            BPlanı
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <Suspense
              fallback={
                <div className="flex flex-col gap-6">
                  <div className="flex flex-col items-center gap-2 text-center">
                    <h1 className="text-2xl font-bold">Yükleniyor...</h1>
                  </div>
                </div>
              }
            >
              <LoginFormWrapper />
            </Suspense>
          </div>
        </div>
      </div>
      <div className="bg-muted relative hidden lg:block">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center p-8">
            <div className="text-6xl font-bold text-primary/20 mb-4">BPlanı</div>
            <p className="text-muted-foreground text-lg">İş Yönetim Platformu</p>
          </div>
        </div>
      </div>
    </div>
  )
}
