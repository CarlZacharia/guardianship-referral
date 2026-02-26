import { LoginForm } from '@/components/auth/LoginForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In — Zacharia Frey Referral Portal',
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: { redirectTo?: string; message?: string }
}) {
  return <LoginForm redirectTo={searchParams.redirectTo} message={searchParams.message} />
}

