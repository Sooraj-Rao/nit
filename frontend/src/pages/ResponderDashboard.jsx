import { Outlet } from "react-router-dom"
import { Siren } from "lucide-react"

const ResponderDashboard = () => {


  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-red-50/20 dark:via-red-950/10 to-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-red-100 dark:bg-red-950/20 rounded-lg">
              <Siren className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Responder Command Center</h1>
              <p className="text-muted-foreground">Monitor emergencies and coordinate response efforts</p>
            </div>
          </div>
        </div>

    
        {/* Main Content */}
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </div>
    </div>
  )
}

export default ResponderDashboard
