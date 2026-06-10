// Auth route protection is handled by proxy.ts
// No server-side auth check needed here
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}