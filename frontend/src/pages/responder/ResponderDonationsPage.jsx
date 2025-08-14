"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import CheckoutForm from "../../components/CheckoutForm"
import { Heart, HandHeart, Shield, Users, CheckCircle, Gift } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"

const stripePromise = loadStripe(
  "pk_test_51Rt2Cy0GWZjRfGD8ZzFag8fgEiI9xQ6A6gmDwgM1oqwzTw0LJ3lqQstLTwGo5fgnOD1Y8r0DaBrFQqdHVdWbQ6Xv00rNpP9tqy",
)

const ResponderDonationsPage = () => {
  const [paymentSuccess, setPaymentSuccess] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center space-x-2 px-4 py-2 bg-green-100 dark:bg-green-950/20 rounded-full">
            <Gift className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Emergency Relief Support</span>
          </div>
          <h1 className="text-4xl font-bold">Support Emergency Relief Missions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Every donation helps save lives, provide essential supplies, and support communities during critical
            emergencies.
          </p>
        </div>

       


        {/* Payment Section */}
        {!paymentSuccess ? (
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-center">Make a Donation</CardTitle>
                <CardDescription className="text-center">
                  Your contribution helps us respond faster and save more lives during emergencies
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Elements stripe={stripePromise}>
                  <CheckoutForm onSuccess={() => setPaymentSuccess(true)} />
                </Elements>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-2xl mx-auto">
            <Card className="border-green-200 bg-green-50 dark:bg-green-950/20">
              <CardContent className="p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-green-700 dark:text-green-400 mb-2">
                  Thank You for Your Donation! 🎉
                </h2>
                <p className="text-green-600 dark:text-green-300 mb-4">
                  Your generosity helps us reach more people in need during emergencies.
                </p>
                <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
                  <Heart className="h-4 w-4" />
                  <span>Your contribution makes a real difference</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Trust Indicators */}
        <Card className='pt-6'>
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center space-x-2">
                <Shield className="h-5 w-5 text-primary" />
                <span className="font-semibold">Trusted Emergency Response Platform</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
                Your donations are securely processed and directly support emergency response teams, medical supplies,
                rescue equipment, and relief efforts for communities in crisis.
              </p>
              <div className="flex items-center justify-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Secure Payments</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Transparent Usage</span>
                </div>
                <div className="flex items-center space-x-1">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Direct Impact</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        {!paymentSuccess && (
          <div className="text-center space-y-4">
            <h3 className="text-xl font-semibold">Every Second Counts in Emergencies</h3>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Your donation helps us maintain rapid response capabilities and provide immediate relief to those who need
              it most.
            </p>
            <Button
              onClick={() =>
                document.querySelector('[data-testid="donation-form"]')?.scrollIntoView({ behavior: "smooth" })
              }
              size="lg"
              className="mt-4"
            >
              <Heart className="h-4 w-4 mr-2" />
              Donate Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponderDonationsPage
