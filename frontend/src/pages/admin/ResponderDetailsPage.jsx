import { useEffect, useState } from "react"
import axios from "axios"
import { Users, UserCheck, MapPin, Hash, Phone, Mail, Search, Filter } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Input } from "../../components/ui/Input"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"

const ResponderDetailsPage = () => {
  const [responders, setResponders] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("responders")

  useEffect(() => {
    const token = localStorage.getItem("token")

    const fetchData = async () => {
      try {
        const [respondersRes, usersRes] = await Promise.all([
          axios.get("http://localhost:5000/api/users/responders", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:5000/api/users/users", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ])
        setResponders(respondersRes.data)
        setUsers(usersRes.data)
      } catch (err) {
        console.error("Failed to fetch data:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const currentData = activeTab === "responders" ? responders : users
  const filteredData = currentData.filter(
    (person) =>
      person.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      person.place.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStats = (data) => ({
    total: data.length,
    places: new Set(data.map((p) => p.place)).size,
    pincodes: new Set(data.map((p) => p.pincode)).size,
  })

  const responderStats = getStats(responders)
  const userStats = getStats(users)

  const StatCard = ({ title, value, description, icon: Icon, color }) => (
    <Card className="hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`p-2 rounded-lg bg-${color}-50 dark:bg-${color}-950/20`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{loading ? "..." : value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )

  const PersonCard = ({ person, index }) => (
    <Card key={person._id} className="hover:shadow-md pt-6 transition-shadow duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">{person.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{person.name}</h3>
              <Badge variant="secondary" className="text-xs capitalize">
                {person.role}
              </Badge>
            </div>
          </div>
          <span className="text-sm text-muted-foreground">#{index + 1}</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Email:</span>
            <span className="font-medium">{person.email}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Phone:</span>
            <span className="font-medium">{person.phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Location:</span>
            <span className="font-medium">{person.place}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">Pincode:</span>
            <span className="font-medium">{person.pincode}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-3">
                  <div className="h-4 bg-muted rounded w-1/2" />
                  <div className="h-8 bg-muted rounded w-1/3" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage responders and users across the emergency response network</p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === "responders" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("responders")}
          className="flex items-center space-x-2"
        >
          <UserCheck className="h-4 w-4" />
          <span>Responders</span>
        </Button>
        <Button
          variant={activeTab === "users" ? "default" : "ghost"}
          size="sm"
          onClick={() => setActiveTab("users")}
          className="flex items-center space-x-2"
        >
          <Users className="h-4 w-4" />
          <span>Users</span>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {activeTab === "responders" ? (
          <>
            <StatCard
              title="Total Responders"
              value={responderStats.total}
              description="Active emergency responders"
              icon={UserCheck}
              color="blue"
            />
            <StatCard
              title="Coverage Areas"
              value={responderStats.places}
              description="Cities and towns covered"
              icon={MapPin}
              color="green"
            />
            <StatCard
              title="Pin Codes"
              value={responderStats.pincodes}
              description="Unique postal codes"
              icon={Hash}
              color="purple"
            />
          </>
        ) : (
          <>
            <StatCard
              title="Total Users"
              value={userStats.total}
              description="Registered community members"
              icon={Users}
              color="green"
            />
            <StatCard
              title="Coverage Areas"
              value={userStats.places}
              description="Cities and towns represented"
              icon={MapPin}
              color="blue"
            />
            <StatCard
              title="Pin Codes"
              value={userStats.pincodes}
              description="Unique postal codes"
              icon={Hash}
              color="purple"
            />
          </>
        )}
      </div>

      {/* Search */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={`Search ${activeTab}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
       
      </div>

      {/* Results */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold capitalize">
            {activeTab} ({filteredData.length})
          </h2>
          {searchTerm && (
            <p className="text-sm text-muted-foreground">
              Showing {filteredData.length} of {currentData.length} results
            </p>
          )}
        </div>

        {filteredData.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No {activeTab} found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? "Try adjusting your search terms" : `No ${activeTab} have been registered yet`}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredData.map((person, index) => (
              <PersonCard key={person._id} person={person} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ResponderDetailsPage