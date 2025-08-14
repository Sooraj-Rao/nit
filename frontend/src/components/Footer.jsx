import { useLocation } from "react-router-dom"
import { Shield, Heart, Github, Mail } from "lucide-react"

const Footer = () => {
  const location = useLocation()

  // Hide footer on login/register pages
  if (location.pathname === "/" || location.pathname === "/register") return null

  const currentYear = new Date().getFullYear()

  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between  gap-8">
          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Emergency Response</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Empowering rapid, effective emergency response through technology and community coordination.
            </p>
          </div>

        

          {/* Emergency Contacts */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Emergency Contacts</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                Fire: <span className="font-medium text-red-500">101</span>
              </li>
              <li>
                Police: <span className="font-medium text-blue-500">100</span>
              </li>
              <li>
                Medical: <span className="font-medium text-green-500">108</span>
              </li>
              <li>
                Disaster: <span className="font-medium text-orange-500">1077</span>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold">Connect With Us</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Mail className="h-5 w-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-foreground transition-colors">
                <Heart className="h-5 w-5" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground">Made with ❤️ for safer communities</p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
          <p>© {currentYear} Emergency Response System. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
