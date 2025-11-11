import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] flex-col items-center justify-center">
      <div className="mx-auto flex max-w-md flex-col items-center text-center">
        <h1 className="text-6xl font-bold">404</h1>
        <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
        <p className="mt-4 text-muted-foreground">
          Sorry, we couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Button asChild className="mt-8">
          <Link href="/">Return Home</Link>
        </Button>
      </div>
    </div>
  )
}
