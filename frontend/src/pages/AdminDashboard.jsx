"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import axios from "axios"
import { Users, UserCheck, AlertTriangle, Activity, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/Card"

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    responders: 0,
    users: 0,
    totalAlerts: 0,
    activeAlerts: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await axios.get("http://localhost:5000/api/auth/stats", {
          headers: { Authorization: `Bearer ${token}` },
        })
        setStats(res.data)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  const statCards = [
    {
      title: "Total Responders",
      value: stats.responders,
      description: "Active emergency responders",
      icon: UserCheck,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
    },
    {
      title: "Registered Users",
      value: stats.users,
      description: "Community members registered",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
    },
    {
      title: "Total Alerts",
      value: stats.alerts || 0,
      description: "Emergency alerts processed",
      icon: AlertTriangle,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/20",
    },
    {
      title: "System Status",
      value: "Active",
      description: "All systems operational",
      icon: Activity,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50 dark:bg-emerald-950/20",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/20 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Monitor and manage emergency response operations</p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const Icon = stat.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-4 w-4 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {loading ? <div className="h-8 w-16 bg-muted animate-pulse rounded" /> : stat.value}
                  </div>
                  <p className="text-xs text-muted-foreground">{stat.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Main Content */}
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
