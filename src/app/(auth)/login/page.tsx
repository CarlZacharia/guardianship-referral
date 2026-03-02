import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Zacharia Brown Referral Portal',
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string; message?: string }>
}) {
  const { redirectTo, message } = await searchParams
  return (
    <div className="max-w-md mx-auto">
      <LoginForm redirectTo={redirectTo} message={message} />
    </div>
  )
}

