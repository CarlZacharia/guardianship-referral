import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { MailCheck } from 'lucide-react'

export default function VerifyPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
          <MailCheck className="w-6 h-6 text-primary" />
        </div>
        <CardTitle>Check Your Email</CardTitle>
        <CardDescription>
          {searchParams.email
            ? `We sent a confirmation link to ${searchParams.email}`
            : 'A confirmation link has been sent to your email address.'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-center">
        <p className="text-sm text-muted-foreground">
          Click the link in the email to activate your account. 
          The link expires in 24 hours.
        </p>
        <p className="text-sm text-muted-foreground">
          If you don&apos;t see it, check your spam folder or contact{' '}
          <a href="mailto:intake@zachariafreylaw.com" className="text-primary hover:underline">
            intake@zachariafreylaw.com
          </a>.
        </p>
        <Button variant="outline" asChild className="w-full">
          <Link href="/login">Back to Sign In</Link>
        </Button>
      </CardContent>
    </Card>
  )
}

