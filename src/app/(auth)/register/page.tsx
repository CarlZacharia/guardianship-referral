import { RegisterForm } from '@/components/auth/RegisterForm'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Create Account — Zacharia Frey Referral Portal',
}

export default function RegisterPage() {
  return <RegisterForm />
}

