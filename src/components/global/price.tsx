export const CURRENCY = 'GBP'

export default function Price({
  amount,
  className
}: {
  amount: number,
  className?: string
}) {
  const formatted = new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: CURRENCY
  }).format(amount / 100)

  return (
    <span className={className}>{formatted}</span>
  )
}