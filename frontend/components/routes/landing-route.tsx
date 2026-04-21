"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { authClient } from "@/lib/auth/client"
import { LandingPage } from "@/components/landing-page"
import { LandingNav } from "@/components/layout/landing-nav"
import { toast } from "@/hooks/use-toast"

export function LandingRoute() {
  const router = useRouter()
  const { data: session } = authClient.useSession()
  const [isAuthPending, setIsAuthPending] = useState(false)
  const isSignedIn = Boolean(session?.user)

  useEffect(() => {
    router.prefetch("/projects")
  }, [router])

  const handleGoogleSignIn = async () => {
    if (isAuthPending) return

    if (isSignedIn) {
      router.push("/projects")
      return
    }

    setIsAuthPending(true)

    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/projects",
      })
    } catch (error) {
      console.error("Social sign-in failed", error)
      setIsAuthPending(false)
      toast({
        title: "Sign-in unavailable",
        description: "Authentication service is temporarily unavailable. Please try again shortly.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="landing-page" style={{ background: "transparent", minHeight: "100vh" }}>
      <LandingNav
        onTryMimic={handleGoogleSignIn}
        isSignedIn={isSignedIn}
        isAuthPending={isAuthPending}
        userId={session?.user.id}
        userName={session?.user.name ?? session?.user.email ?? "User"}
        onOpenDashboard={() => router.push("/projects")}
      />
      <LandingPage onGetStarted={handleGoogleSignIn} isSignedIn={isSignedIn} isAuthPending={isAuthPending} />
    </div>
  )
}
