'use client'

import { CartesianGrid, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'
import './global.scss'
import { useState } from 'react'
import { CategoricalChartState } from 'recharts/types/chart/types'

type MonthlyUsage = {
  name: string
  count: number
}


export default function UsageChart({ usage }: { usage: any }) {
  const [activeIndex, setActiveIndex] = useState(-1)
  const [activeDate, setActiveDate] = useState('')
  const dateOptions: Intl.DateTimeFormatOptions = {
    month: 'short',
    day: 'numeric'
  }
  const formattedData: MonthlyUsage[] = []
  let i = 1
  do {
    const date = new Date(`2024/4/${i}`)
    date.setHours(0)
    date.setMinutes(0)

    formattedData.push({
      name: date.toLocaleDateString('en-GB', dateOptions),
      count: usage.optimize['2024']['4'][i] || 0
    })

    i++
  } while (i < 31)

  function handleMouseMove(state: CategoricalChartState) {
    if (state.isTooltipActive) {
      setActiveIndex(state.activeTooltipIndex ?? -1)

      const date = new Date(`2024/4/${(state.activeTooltipIndex ?? 0) + 1}`)
      setActiveDate(date.toLocaleDateString('en-GB', dateOptions))
    } else {
      setActiveIndex(-1)
      setActiveDate('')
    }
  }

  return (
    <div>
      <LineChart
        width={730}
        height={250}
        data={formattedData}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5
        }}
        onMouseMove={handleMouseMove}
      >
        <CartesianGrid strokeDasharray="3 3" strokeOpacity={.2}  />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Line type="monotone" dataKey="count" stroke="#5E13A9" />
      </LineChart>
      {activeIndex >= 0 ? (
        <p>Showing {activeDate}</p>
      ) : (
        <p>Showing all data.</p>
      )}
    </div>
  )
}