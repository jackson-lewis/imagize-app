import SiteHeader from '@/components/site/site-header'

export default function SiteLayout({
  children
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <SiteHeader />
      {children}
    </>
  )
}