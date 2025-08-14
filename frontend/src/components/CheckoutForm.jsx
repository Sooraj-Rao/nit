import { useState } from "react";
import { CardElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { useNavigate } from "react-router-dom";
import {
  User,
  Mail,
  CreditCard,
  IndianRupee,
  Loader2,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Card, CardContent } from "./ui/Card";
import { useTheme } from "../context/theme-context";

const CheckoutForm = ({ onSuccess, redirectTo }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { theme } = useTheme();

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!stripe || !elements) return;

    if (Number(amount) < 50) {
      alert("Minimum donation amount is ₹50.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "http://localhost:5000/api/create-payment-intent",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount, name, email }),
        }
      );

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Something went wrong");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (result.error) {
        alert(result.error.message);
      } else if (result.paymentIntent.status === "succeeded") {
        setSuccess(true);
        setTimeout(() => {
          if (typeof onSuccess === "function") {
            onSuccess();
          } else if (redirectTo) {
            navigate(redirectTo);
          } else {
            navigate("/");
          }
        }, 2000);
      }
    } catch (err) {
      console.error("Error:", err);
      alert(err.message || "Payment failed");
    }

    setLoading(false);
  };

  if (success) {
    return (
      <div className="text-center space-y-4 py-8">
        <div className="w-16 h-16 bg-green-100 dark:bg-green-950/20 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-xl font-semibold text-green-700 dark:text-green-400">
          Payment Successful!
        </h3>
        <p className="text-muted-foreground">
          Thank you for your generous donation. You're making a real difference!
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter your name"
              className="pl-10"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="email"
              placeholder="Enter your email"
              className="pl-10"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      {/* Donation Amount */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Donation Amount</label>
        <div className="relative">
          <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="number"
            min="50"
            placeholder="Enter amount (minimum ₹50)"
            className="pl-10"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
          />
        </div>
        <div className="flex space-x-2 mt-2">
          {[100, 500, 1000, 2500].map((preset) => (
            <Button
              key={preset}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAmount(preset.toString())}
              className="text-xs"
            >
              ₹{preset}
            </Button>
          ))}
        </div>
      </div>

      {/* Card Information */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Card Information</label>
        <Card className="pt-6">
          <CardContent className="p-0">
            <div className="relative  ">
              <div className="pl-10s">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: "16px",
                        color: theme === "light" ? "black" : "white",
                        "::placeholder": {
                          color: "hsl(var(--muted-foreground))",
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={!stripe || loading}
        className="w-full"
        size="lg"
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Processing Payment...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4" />
            <span>Donate ₹{amount || "0"}</span>
          </div>
        )}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-xs text-muted-foreground">
        <p>🔒 Your payment information is secure and encrypted</p>
      </div>
    </form>
  );
};

export default CheckoutForm;
