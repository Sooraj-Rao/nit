import { useEffect, useState } from "react";
import {
  Siren,
  Shield,
  Clock,
  Users,
  AlertTriangle,
  Activity,
  CheckCircle,
  MapPin,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Badge } from "../../components/ui/Badge";

const ResponderHomePage = () => {
  const [loading, setLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(timeInterval);
    };
  }, []);

  const missionCards = [
    {
      title: "Emergency Response",
      description:
        "Respond to critical alerts with speed and precision to save lives in emergency situations.",
      icon: Siren,
      color: "text-red-600",
      bgColor: "bg-red-50 dark:bg-red-950/20",
      stats: "24/7 Ready",
    },
    {
      title: "Community Safety",
      description:
        "Protect and serve the community through proactive safety measures and emergency preparedness.",
      icon: Shield,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/20",
      stats: "Always Vigilant",
    },
    {
      title: "Team Coordination",
      description:
        "Work seamlessly with fellow responders and volunteers to maximize emergency response effectiveness.",
      icon: Users,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/20",
      stats: "United Force",
    },
    {
      title: "Rapid Deployment",
      description:
        "Quick mobilization and strategic positioning for optimal emergency response coverage.",
      icon: MapPin,
      color: "text-purple-600",
      bgColor: "bg-purple-50 dark:bg-purple-950/20",
      stats: "Strategic",
    },
  ];

  const statusCards = [
    {
      title: "Response Time",
      value: "2.8 min",
      description: "Average response time",
      icon: Clock,
      trend: "Excellent",
    },
    {
      title: "Active Alerts",
      value: "5",
      description: "Currently monitoring",
      icon: AlertTriangle,
      trend: "Normal",
    },
    {
      title: "Completed Today",
      value: "8",
      description: "Successfully resolved",
      icon: CheckCircle,
      trend: "Good",
    },
    {
      title: "System Status",
      value: "Online",
      description: "All systems operational",
      icon: Activity,
      trend: "Stable",
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-950/20 rounded-full flex items-center justify-center animate-pulse">
            <Siren className="h-8 w-8 text-red-600" />
          </div>
          <p className="text-muted-foreground">
            Loading Emergency Response System...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-950/20 rounded-full">
          <Siren className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            Emergency Responder
          </span>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">Command Center</h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Stay alert, coordinate fast, and protect lives. Your dedication makes
          the difference in critical moments.
        </p>
      </div>

      {/* Mission Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {missionCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <Card
              key={index}
              className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02]"
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-lg ${card.bgColor}`}>
                    <Icon className={`h-6 w-6 ${card.color}`} />
                  </div>
                  <Badge variant="outline">{card.stats}</Badge>
                </div>
                <CardTitle className="text-xl">{card.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {card.description}
                </CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      {/* Emergency Protocols */}
      <Card className="bg-gradient-to-r pt-6 from-red-50 via-orange-50 to-yellow-50 dark:from-red-950/10 dark:via-orange-950/10 dark:to-yellow-950/10 border-red-200 dark:border-red-800">
        <CardContent className="p-8">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center space-x-2 text-red-600">
              <AlertTriangle className="h-6 w-6" />
              <span className="text-lg font-semibold">
                Emergency Protocols Active
              </span>
            </div>
            <h3 className="text-2xl font-bold">Ready for Immediate Response</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All emergency protocols are active and ready. Your quick response
              and professional expertise are crucial for saving lives and
              protecting our community.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">101</div>
                <div className="text-xs text-muted-foreground">
                  Fire Emergency
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">100</div>
                <div className="text-xs text-muted-foreground">Police</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">108</div>
                <div className="text-xs text-muted-foreground">Medical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">1077</div>
                <div className="text-xs text-muted-foreground">Disaster</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Motivational Quote */}
      <Card className="bg-gradient-to-r pt-6 from-primary/5 to-secondary/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <blockquote className="text-xl font-medium italic text-foreground mb-4">
            "In the middle of disaster, heroes rise. Be the first to act, the
            last to leave, and the reason someone survives."
          </blockquote>
          <p className="text-sm text-muted-foreground">
            — Emergency Responder's Creed
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResponderHomePage;
