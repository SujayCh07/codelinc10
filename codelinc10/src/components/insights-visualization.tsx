"use client"

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Card } from "@/components/ui/card"

interface InsightsVisualizationProps {
  data: {
    spendingCategories?: { name: string; value: number; color: string }[]
    savingsProgress?: { month: string; saved: number; target: number }[]
    coverageBreakdown?: { category: string; covered: number; needed: number }[]
  }
}

export function InsightsVisualization({ data }: InsightsVisualizationProps) {
  const { spendingCategories, savingsProgress, coverageBreakdown } = data

  // Default placeholder data if none provided
  const defaultSpending = [
    { name: "Healthcare", value: 30, color: "#A41E34" },
    { name: "Retirement", value: 25, color: "#7F1527" },
    { name: "Insurance", value: 20, color: "#D4526E" },
    { name: "Savings", value: 15, color: "#F9EDEA" },
    { name: "Other", value: 10, color: "#E2D5D7" },
  ]

  const defaultSavings = [
    { month: "Jan", saved: 500, target: 800 },
    { month: "Feb", saved: 650, target: 800 },
    { month: "Mar", saved: 700, target: 800 },
    { month: "Apr", saved: 750, target: 800 },
    { month: "May", saved: 800, target: 800 },
    { month: "Jun", saved: 820, target: 800 },
  ]

  const spending = spendingCategories || defaultSpending
  const savings = savingsProgress || defaultSavings

  return (
    <div className="space-y-6">
      {/* Financial Allocation */}
      <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">
              Financial Allocation
            </h3>
            <p className="mt-2 text-sm text-[#4D3B3B]">
              How your benefits budget is distributed across categories
            </p>
          </div>
          <div className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={spending}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {spending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FBF7F6',
                    border: '1px solid #E2D5D7',
                    borderRadius: '12px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>

      {/* Savings Progress */}
      <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-md">
        <div className="space-y-4">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">
              Savings Trajectory
            </h3>
            <p className="mt-2 text-sm text-[#4D3B3B]">
              Your progress toward monthly savings goals
            </p>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={savings}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2D5D7" />
              <XAxis dataKey="month" stroke="#4D3B3B" />
              <YAxis stroke="#4D3B3B" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FBF7F6',
                  border: '1px solid #E2D5D7',
                  borderRadius: '12px',
                }}
              />
              <Legend />
              <Bar dataKey="saved" fill="#A41E34" name="Saved" radius={[8, 8, 0, 0]} />
              <Bar dataKey="target" fill="#F9EDEA" name="Target" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </div>
  )
}
