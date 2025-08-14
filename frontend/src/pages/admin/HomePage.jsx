import { Shield, Users, AlertTriangle, Activity, TrendingUp, Clock, CheckCircle, MapPin } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Badge } from "../../components/ui/Badge"

const HomePage = () => {
  const features = [
    {
      title: "Emergency Broadcast",
      description: "Instantly notify all responders and volunteers during critical situations with real-time alerts.",
      icon: AlertTriangle,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      stats: "24/7 Active",
    },
    {
      title: "Responder Management",
      description: "Track, assign, and coordinate trained responders for optimal emergency response efficiency.",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      stats: "Real-time",
    },
    {
      title: "Volunteer Coordination",
      description: "Organize community volunteers for support operations, logistics, and relief efforts.",
      icon: Shield,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      stats: "Community Driven",
    },
    {
      title: "Incident Mapping",
      description: "Visualize emergency locations and track response progress with interactive mapping tools.",
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      stats: "GPS Enabled",
    },
  ]

  const quickStats = [
    {
      title: "Response Time",
      value: "3.2 min",
      change: "+12%",
      trend: "up",
      icon: Clock,
    },
    {
      title: "Success Rate",
      value: "94.8%",
      change: "+2.1%",
      trend: "up",
      icon: CheckCircle,
    },
    {
      title: "Active Alerts",
      value: "7",
      change: "-3",
      trend: "down",
      icon: AlertTriangle,
    },
    {
      title: "System Health",
      value: "99.9%",
      change: "Stable",
      trend: "stable",
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
          <Shield className="h-5 w-5 text-primary" />
          <span className="text-sm font-medium text-primary">Admin Control Center</span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Welcome to Emergency Command</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Monitor, coordinate, and manage emergency response operations with real-time insights and powerful tools.
        </p>
      </div>


      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Card key={index} className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${feature.bgColor}`}>
                    <Icon className={`h-6 w-6 ${feature.color}`} />
                  </div>
                  <Badge variant="secondary">{feature.stats}</Badge>
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          )
        })}
      </div>

      {/* Call to Action */}
      <Card className="bg-gradient-to-r pt-6 from-primary/10 via-primary/5 to-transparent border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="space-y-4">
            <div className="inline-flex items-center space-x-2 text-primary">
              <Activity className="h-6 w-6" />
              <span className="text-lg font-semibold">System Status: Operational</span>
            </div>
            <h3 className="text-2xl font-bold">Every Decision Saves Lives</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your leadership ensures timely response, minimizes damage, and coordinates effective disaster management
              across all emergency scenarios.
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span>All Systems Online</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                <span>Real-time Monitoring</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage