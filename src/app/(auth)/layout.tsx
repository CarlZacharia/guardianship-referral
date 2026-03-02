import Image from 'next/image'
import Link from 'next/link'

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-[#F5F6F8] flex flex-col">
      {/* Header */}
      <header className="py-6 px-8 border-b bg-white/80 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-sm">
              ZF
            </div>
            <div>
              <div className="font-semibold text-foreground">Zacharia Brown </div>
              <div className="text-xs text-muted-foreground">
                Estate Planning · Elder Law · Asset Protection
              </div>
            </div>
          </div>
          <Link href="/why-hire-us" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Why Hire Us?
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl">
          {children}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 px-8 text-center text-xs text-muted-foreground border-t bg-white/50">
        26811 South Bay Drive, Suite 270 · Bonita Springs, FL 34134 ·{' '}
        <a href="tel:2393454545" className="hover:text-primary">239.345.4545</a>
        {' '}· This portal is for authorized referral partners only.
      </footer>
    </div>
  )
}

