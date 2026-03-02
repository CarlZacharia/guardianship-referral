import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  Scale, FileCheck, Shield, ArrowRight, Phone, Mail, CheckCircle2,
} from 'lucide-react'

export const metadata: Metadata = {
  title: 'Why Hire Us? — Zacharia Brown Referral Portal',
}

export default function WhyHireUsPage() {
  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Why Partner With Us?
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          One firm. Two critical services. Faster Medicaid approvals and
          legally sound guardianships — so your team can focus on patient care.
        </p>
      </div>

      {/* Guardianship & Medicaid Section */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-6 py-5 flex items-center gap-3">
          <div className="rounded-full bg-primary/15 p-2.5">
            <Scale className="w-5 h-5 text-primary" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Guardianship &amp; Medicaid Services
          </h2>
        </div>
        <CardContent className="px-6 py-6 space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            When a resident or patient lacks the capacity to manage their own
            affairs, securing a guardianship and navigating the Medicaid
            application process can place an enormous burden on your
            facility&apos;s staff and resources. By partnering with a law firm
            that handles both guardianship and Medicaid, you gain a{' '}
            <span className="font-medium text-foreground">
              single point of contact
            </span>{' '}
            who understands how these two processes intersect — from obtaining
            the legal authority to act on behalf of an incapacitated individual
            to marshaling their financial information and filing a timely
            Medicaid application. This streamlined approach eliminates the
            delays and miscommunication that often arise when multiple providers
            are involved, helping your facility convert private-pay or pending
            accounts to Medicaid coverage more quickly and reliably.
          </p>

          <div className="rounded-lg bg-muted/50 border p-4">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                A dedicated legal team ensures that every step — the
                guardianship petition, the examination committee, the court
                hearing, and the Medicaid application — is handled in{' '}
                <span className="font-medium text-foreground">
                  compliance with Florida law
                </span>
                , reducing the risk of costly errors or denials that can leave
                your facility carrying an unpaid balance for months. We
                understand the time pressures your business office faces and the
                financial impact that delayed Medicaid eligibility has on your
                census and cash flow. Our goal is to move each case from
                referral to approved Medicaid coverage as efficiently as
                possible, keeping you informed at every stage so you can focus
                on what matters most: patient care.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Medicaid Application Section */}
      <Card className="overflow-hidden border-0 shadow-lg">
        <div className="bg-gradient-to-r from-emerald-500/10 to-emerald-500/5 px-6 py-5 flex items-center gap-3">
          <div className="rounded-full bg-emerald-500/15 p-2.5">
            <FileCheck className="w-5 h-5 text-emerald-600" />
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Medicaid Application Services
          </h2>
        </div>
        <CardContent className="px-6 py-6 space-y-5">
          <p className="text-sm leading-relaxed text-muted-foreground">
            Filing a Florida Medicaid long-term care application involves far
            more than completing forms — it requires a thorough understanding of
            income and asset eligibility rules, proper documentation of
            spend-down transactions, and the ability to respond quickly to
            Requests for Information from the Department of Children and
            Families. When a law firm manages this process, your facility
            benefits from an advocate who can identify and resolve eligibility
            issues before they become denials, properly structure any asset
            transfers or spousal protections, and pursue fair hearing appeals
            when necessary. This level of legal expertise translates directly
            into{' '}
            <span className="font-medium text-foreground">
              faster approvals and fewer disruptions
            </span>{' '}
            to your revenue cycle.
          </p>

          <div className="rounded-lg bg-muted/50 border p-4">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 mt-0.5 shrink-0" />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Having an attorney handle Medicaid applications also protects
                your facility from the{' '}
                <span className="font-medium text-foreground">
                  compliance risks
                </span>{' '}
                that can arise when untrained staff attempt to advise families
                on financial decisions or document preparation. We serve as a
                resource for your residents&apos; families, guiding them through
                a confusing and stressful process while keeping your team
                informed of each case&apos;s status. The result is a
                professional, legally sound process that strengthens your
                facility&apos;s reputation with families and referral sources
                while improving your Medicaid approval rates and reducing your
                accounts receivable.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* CTA */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-slate-900 to-slate-800 text-white">
        <CardContent className="px-6 py-8 text-center space-y-4">
          <h3 className="text-lg font-semibold">Ready to get started?</h3>
          <p className="text-sm text-slate-300 max-w-lg mx-auto">
            Register as a referral partner to begin submitting guardianship and
            Medicaid cases through our secure portal.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Button asChild className="cursor-pointer">
              <Link href="/register">
                Create an Account <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="cursor-pointer border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
            >
              <Link href="tel:2393454545">
                <Phone className="w-4 h-4 mr-2" /> Call 239.345.4545
              </Link>
            </Button>
            <Button
              variant="outline"
              asChild
              className="cursor-pointer border-slate-600 text-slate-800 hover:bg-slate-700 hover:text-white"
            >
              <Link href="mailto:info@zacbrownlaw.com">
                <Mail className="w-4 h-4 mr-2" /> info@zacbrownlaw.com
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Back to login */}
      <div className="text-center pb-4">
        <Link
          href="/login"
          className="text-sm text-muted-foreground hover:text-primary"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </div>
  )
}
