'use client'

import { SessionProvider } from "next-auth/react"
import { ToastProvider } from "@/contexts/ToastContext"
import { QueryProvider } from "@/components/providers/QueryProvider"
import { useLocale } from "next-intl"
import { useEffect } from "react"
import { setErrorMessageLocale } from "@/lib/errors/user-messages"

/** Syncs the next-intl locale into the error-message module on mount / locale change. */
function ErrorLocaleSync() {
  const locale = useLocale()
  useEffect(() => {
    setErrorMessageLocale(locale)
  }, [locale])
  return null
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider
      refetchOnWindowFocus={false}
      refetchInterval={0}
    >
      <QueryProvider>
        <ToastProvider>
          <ErrorLocaleSync />
          {children}
        </ToastProvider>
      </QueryProvider>
    </SessionProvider>
  )
}
