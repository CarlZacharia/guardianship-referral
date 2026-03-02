import { RegisterForm } from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account — Zacharia Brown Referral Portal',
}

export default function RegisterPage() {
  return (
    <div className="max-w-md mx-auto">
      <RegisterForm />
    </div>
  )
}

