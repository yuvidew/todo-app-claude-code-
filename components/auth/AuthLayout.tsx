import { Card, CardContent } from "@/components/ui/card"

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background px-4 py-10 sm:px-6">
      <div className="w-full max-w-[420px]">
        <Card className="w-full">
          <CardContent className="flex flex-col gap-6 px-6 sm:px-8">{children}</CardContent>
        </Card>
      </div>
    </div>
  )
}
