"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { getUserRole } from "../utils/auth"
import { Shield, Menu, X, LogOut, Sun, Moon, Home, AlertTriangle, Users, Settings, Heart } from "lucide-react"
import { Button } from "./ui/Button"
import { useTheme } from "../context/theme-context"

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const role = getUserRole()
  const { theme, toggleTheme } = useTheme()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    navigate("/")
  }

  const navigationItems = {
    admin: [
      { label: "Dashboard", path: "/admin/home", icon: Home },
      { label: "Manage Alerts", path: "/admin/add-alert", icon: AlertTriangle },
      { label: "Users & Responders", path: "/admin/responders", icon: Users },
      { label: "Donations & Events", path: "/admin/users", icon: Heart },
    ],
    responder: [
      { label: "Dashboard", path: "/responder/home", icon: Home },
      { label: "Emergency Alerts", path: "/responder/alerts", icon: AlertTriangle },
      { label: "Donations", path: "/responder/donations", icon: Heart },
      { label: "Training Events", path: "/responder/tasks", icon: Settings },
    ],
    user: [{ label: "Dashboard", path: "/user", icon: Home }],
  }

  const currentNavItems = navigationItems[role] || []

  const isActivePath = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + "/")
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <span className="text-xl font-bold  text-primary">
              Emergency Response
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {currentNavItems.map((item) => {
              const Icon = item.icon
              return (
                <Button
                  key={item.path}
                  variant={isActivePath(item.path) ? "default" : "ghost"}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className="flex items-center space-x-2"
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </Button>
              )
            })}
          </div>

          {/* Right side actions */}
          <div className="flex items-center space-x-2">
            {/* Role Badge */}
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">Role:</span>
              <span className="px-2 py-1 text-xs font-medium bg-primary/10 text-primary rounded-full capitalize">
                {role}
              </span>
            </div>

            {/* Theme Toggle */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="relative">
              <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            </Button>

            {/* Logout Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex items-center space-x-2 bg-transparent"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {currentNavItems.map((item) => {
                const Icon = item.icon
                return (
                  <Button
                    key={item.path}
                    variant={isActivePath(item.path) ? "default" : "ghost"}
                    className="w-full justify-start space-x-2"
                    onClick={() => {
                      navigate(item.path)
                      setIsMobileMenuOpen(false)
                    }}
                  >
                    <Icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Button>
                )
              })}
              <div className="pt-2 border-t">
                <Button
                  variant="outline"
                  className="w-full justify-start space-x-2 bg-transparent"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
