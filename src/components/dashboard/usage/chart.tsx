'use client'

import { useMemo } from 'react'
import { AxisOptions, Chart } from 'react-charts'

type MonthlyUsage = {
  date: Date
  usage: number
}

type Series = {
  label: string
  data: MonthlyUsage[]
}


export default function UsageChart({ usage }) {
  const formattedData: MonthlyUsage[] = []
  let i = 1
  do {
    const date = new Date(`2024/4/${i}`)
    date.setHours(0)
    date.setMinutes(0)

    formattedData.push({
      date,
      usage: usage.optimize['2024']['4'][i] || 0
    })

    i++
  } while (i < 31)

  const data: Series[] = [
    {
      label: 'Monthly Usage',
      data: formattedData
    }
  ]

  const primaryAxis = useMemo<
    AxisOptions<MonthlyUsage>
  >(
    () => ({
      getValue: (datum) => datum.date
    }),
    []
  );

  const secondaryAxes = useMemo<
    AxisOptions<MonthlyUsage>[]
  >(
    () => [
      {
        getValue: (datum) => datum.usage,
        // elementType: 'bar'
      },
    ],
    []
  );

  return (
    <Chart
      options={{
        data,
        primaryAxis,
        secondaryAxes
      }}
    />
  )
}