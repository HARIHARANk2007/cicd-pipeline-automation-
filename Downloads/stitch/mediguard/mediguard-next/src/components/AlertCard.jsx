import React from 'react'

export default function AlertCard({ title = 'Alert', children }) {
  return (
    <div className="p-3 rounded-lg border-l-4 border-red-500 bg-white shadow-sm border border-[#DFE1E6]">
      <div className="font-semibold text-on-surface">{title}</div>
      <div className="text-sm text-on-surface-variant mt-1">{children}</div>
    </div>
  )
}
