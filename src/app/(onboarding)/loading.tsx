import { Loader2 } from 'lucide-react'

export default function OnboardingLoading() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  )
}
