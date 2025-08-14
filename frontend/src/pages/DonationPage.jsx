import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Heart, Shield, Users, Zap } from 'lucide-react'
import CheckoutForm from "../components/CheckoutForm"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card"

const stripePromise = loadStripe("pk_test_51Rt2Cy0GWZjRfGD8ZzFag8fgEiI9xQ6A6gmDwgM1oqwzTw0LJ3lqQstLTwGo5fgnOD1Y8r0DaBrFQqdHVdWbQ6Xv00rNpP9tqy")

const DonationPage = () => {
  const impactStats = [
    {
      icon: Users,
      value: "10,000+",
      label: "Lives Impacted",
      description: "People helped through emergency response",
    },
    {
      icon: Shield,
      value: "500+",
      label: "Emergencies Handled",
      description: "Critical situations resolved successfully",
    },
    {
      icon: Zap,
      value: "2.5 min",
      label: "Average Response",
      description: "Quick response time saves lives",
    },
    {
      icon: Heart,
      value: "24/7",
      label: "Always Ready",
      description: "Round-the-clock emergency coverage",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center space-y-6 mb-12">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-primary/10 rounded-full">
            <Heart className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Make a Difference</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">Support Emergency Relief</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Your donation helps us respond faster to emergencies, save more lives, and build stronger, safer communities.
            Every contribution makes a real difference.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Donation Form */}
          <div className="order-2 lg:order-1">
            <Card className="shadow-2xl border-0 bg-card/50 backdrop-blur-sm">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">Make Your Donation</CardTitle>
                <CardDescription>Secure payment powered by Stripe</CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <CheckoutForm redirectTo="/user" />
                </Elements>
              </CardContent>
            </Card>
          </div>

          {/* Impact Section */}
          <div className="order-1 lg:order-2 space-y-8">
        
            {/* How Your Money Helps */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  <span>How Your Money Helps</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <div className="font-medium">₹100 - Emergency Supplies</div>
                    <div className="text-sm text-muted-foreground">Provides basic emergency supplies for one family</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <div className="font-medium">₹500 - Medical Aid</div>
                    <div className="text-sm text-muted-foreground">Covers medical supplies and first aid equipment</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <div className="font-medium">₹1000 - Training Programs</div>
                    <div className="text-sm text-muted-foreground">Funds responder training and certification</div>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2" />
                  <div>
                    <div className="font-medium">₹2500 - Equipment</div>
                    <div className="text-sm text-muted-foreground">Purchases emergency response equipment</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Trust Indicators */}
            <Card className="bg-green-50 pt-6 dark:bg-green-950/20 border-green-200 dark:border-green-800">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <Shield className="h-6 w-6 text-green-600" />
                  <span className="font-semibold text-green-700 dark:text-green-400">Secure & Trusted</span>
                </div>
                <ul className="space-y-2 text-sm text-green-700 dark:text-green-300">
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>SSL encrypted payments</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>100% of donations go to emergency relief</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>Transparent fund allocation</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    <span>Regular impact reports</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16 ">
          <Card className="bg-gradient-to-r pt-6 from-primary/10 via-primary/5 to-transparent border-primary/20">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold mb-4">Together, We Save Lives</h3>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Join thousands of donors who believe in the power of community and emergency preparedness. Your
                generosity creates a safer world for everyone.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DonationPage