"use client"

import { useEffect, useState, useRef } from "react"
import axios from "axios"
import ChatBox from "../../components/ChatBox"
import { AlertTriangle, MapPin, MessageSquare, Shield, Clock, CheckCircle, Users, Loader2, X, Map } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { toast } from "react-toastify"

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
})

const ResponderAlertsPage = () => {
  const [adminAlerts, setAdminAlerts] = useState([])
  const [userAlerts, setUserAlerts] = useState([])
  const [currentUserId, setCurrentUserId] = useState(null)
  const [currentUserName, setCurrentUserName] = useState("")
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("admin")
  const [activeChatAlertId, setActiveChatAlertId] = useState(null)
  const [alertProgress, setAlertProgress] = useState({})
  const [showMapModal, setShowMapModal] = useState(false)
  const [selectedAlert, setSelectedAlert] = useState(null)

  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const progressOptions = ["Dispatched", "On the Way", "Arrived", "Handling Incident", "Resolved"]

  const fetchCurrentUser = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
      setCurrentUserId(res.data._id)
      setCurrentUserName(res.data.name)
    } catch (err) {
      console.error("Failed to get current user info:", err)
    }
  }

  const fetchAdminAlerts = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = Array.isArray(res.data) ? res.data : res.data.alerts
      setAdminAlerts(data || [])
    } catch (err) {
      console.error("Error fetching admin alerts:", err)
      setAdminAlerts([])
    }
  }

  const fetchUserAlerts = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await axios.get("http://localhost:5000/api/user-alerts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = Array.isArray(res.data) ? res.data : res.data.alerts
      setUserAlerts(data || [])

      // Initialize alertProgress state
      const initialProgress = {}
      if (data) {
        data.forEach((alert) => {
          if (alert._id && alert.progressStatus) {
            initialProgress[alert._id] = alert.progressStatus
          }
        })
      }
      setAlertProgress(initialProgress)
    } catch (err) {
      console.error("Error fetching user alerts:", err)
      setUserAlerts([])
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchCurrentUser(), fetchAdminAlerts(), fetchUserAlerts()])
      setLoading(false)
    }
    loadData()
  }, [])

  // Initialize map when modal opens
  useEffect(() => {
    if (showMapModal && selectedAlert && mapRef.current && !mapInstanceRef.current) {
      const locationData = getLocationData(selectedAlert)
      if (locationData && locationData.lat && locationData.lng) {
        mapInstanceRef.current = L.map(mapRef.current).setView([locationData.lat, locationData.lng], 15)

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(mapInstanceRef.current)

        markerRef.current = L.marker([locationData.lat, locationData.lng])
          .addTo(mapInstanceRef.current)
          .bindPopup(`
            <div>
              <strong>${selectedAlert.incident}</strong><br/>
              <small>${locationData.address}</small>
            </div>
          `)
          .openPopup()
      }
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove()
        mapInstanceRef.current = null
        markerRef.current = null
      }
    }
  }, [showMapModal, selectedAlert])

  const getLocationData = (alert) => {
    try {
      if (alert.location) {
        return JSON.parse(alert.location)
      } else if (alert.place) {
        return JSON.parse(alert.place)
      }
      return null
    } catch (error) {
      console.error("Error parsing location data:", error)
      return null
    }
  }

  const handleViewOnMap = (alert) => {
    const locationData = getLocationData(alert)
    if (locationData && locationData.lat && locationData.lng) {
      setSelectedAlert(alert)
      setShowMapModal(true)
    } else {
      toast.error("Location data not available for this alert")
    }
  }

  const closeMapModal = () => {
    setShowMapModal(false)
    setSelectedAlert(null)
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove()
      mapInstanceRef.current = null
      markerRef.current = null
    }
  }

  const handleRespond = async (alertId, type = "admin") => {
    try {
      const token = localStorage.getItem("token")
      const url =
        type === "admin"
          ? `http://localhost:5000/api/alerts/respond/${alertId}`
          : `http://localhost:5000/api/user-alerts/respond/${alertId}`

      await axios.post(
        url,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      )

      // Refresh data
      if (type === "admin") {
        fetchAdminAlerts()
      } else {
        fetchUserAlerts()
      }
    } catch (err) {
      console.error("Failed to respond to alert:", err)
      toast.error("Failed to mark as available.")
    }
  }

  const getResponderStatus = (alert, type = "admin") => {
    if (!currentUserId) return "loading"
    const list = type === "admin" ? alert.responders : alert.users
    const hasResponded = list?.some((r) => r?.user?._id === currentUserId)
    const assigned = alert.assignedResponder?._id === currentUserId
    if (assigned) return "assigned"
    if (hasResponded) return "waiting"
    return "not_responded"
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Low":
        return "success"
      case "Moderate":
        return "warning"
      case "High":
        return "destructive"
      case "Critical":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const handleProgressChange = async (alertId, newStatus) => {
    try {
      await axios.put(`http://localhost:5000/api/user-alerts/${alertId}/progress`, {
        progressStatus: newStatus,
      })

      setAlertProgress((prev) => ({
        ...prev,
        [alertId]: newStatus,
      }))
    } catch (error) {
      console.error("Failed to save progress status:", error)
    }
  }

  const renderAlerts = (alerts, type = "admin") => {
    if (alerts.length === 0) {
      return (
        <Card>
          <CardContent className="p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No {type} alerts</h3>
            <p className="text-muted-foreground">
              {type === "admin" ? "No admin alerts available at the moment" : "No user alerts to respond to"}
            </p>
          </CardContent>
        </Card>
      )
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {alerts.map((alert) => {
          const status = getResponderStatus(alert, type)
          const isChatOpen = activeChatAlertId === alert._id
          const locationData = getLocationData(alert)
          const place = locationData?.address || alert.place || alert.location?.address || "N/A"

          return (
            <Card key={alert._id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center space-x-2">
                    <Shield className="h-5 w-5 text-primary" />
                    <span>{alert.incident}</span>
                  </CardTitle>
                  <Badge variant={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                </div>
                <CardDescription>Reported on {new Date(alert.createdAt).toLocaleDateString()}</CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex truncate items-center space-x-2 flex-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Location:</span>
                      <span className="truncate">{place}</span>
                    </div>
                  </div>
                    {locationData && locationData.lat && locationData.lng && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewOnMap(alert)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Map className="h-3 w-3 mr-1" />
                        View
                      </Button>
                    )}

                  {(alert.additionalDetails || alert.description) && (
                    <div className="flex items-start space-x-2 text-sm">
                      <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
                      <div>
                        <span className="font-medium">Details:</span>
                        <p className="text-muted-foreground mt-1">{alert.additionalDetails || alert.description}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Responders List */}
                {(alert.responders?.length > 0 || alert.users?.length > 0) && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm font-medium">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>Responders:</span>
                    </div>
                    <div className="space-y-1">
                      {(alert.responders || alert.users || []).map((r, i) => {
                        const user = r?.user || r
                        const assignedId = alert.assignedResponder?._id || alert.assignedResponder
                        const isAssigned = assignedId?.toString() === user?._id?.toString()

                        return (
                          <div key={i} className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded">
                            <span>
                              {user?.name || "Unknown"} ({user?.email || "N/A"})
                            </span>
                            {isAssigned ? (
                              <Badge variant="success" className="text-xs">
                                Assigned
                              </Badge>
                            ) : !assignedId ? (
                              // <Button
                              //   size="sm"
                              //   variant="outline"
                              //   onClick={() =>
                              //     handleAssignResponder(alert.isUser ? `user_${alert._id}` : alert._id, user._id)
                              //   }
                              // >
                              //   Assign
                              // </Button>
                              <></>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                Available
                              </Badge>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2">
                  {status === "not_responded" && (
                    <Button onClick={() => handleRespond(alert._id, type)} className="flex-1">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Mark as Available
                    </Button>
                  )}

                  {status === "waiting" && (
                    <Button variant="secondary" disabled className="flex-1">
                      <Clock className="h-4 w-4 mr-2" />
                      Waiting for Assignment
                    </Button>
                  )}

                  {status === "assigned" && (
                    <>
                      {type === "user" ? (
                        <>
                          <Button variant="outline" onClick={() => setActiveChatAlertId(isChatOpen ? null : alert._id)}>
                            <MessageSquare className="h-4 w-4 mr-2" />
                            {isChatOpen ? "Close Chat" : "Open Chat"}
                          </Button>

                          {/* Progress Status Dropdown */}
                          <div className="w-full mt-2">
                            <label className="block text-sm font-medium mb-1">Progress Status</label>
                            <select
                              className="w-full p-2 border rounded-md bg-background"
                              value={alertProgress[alert._id] || ""}
                              onChange={(e) => handleProgressChange(alert._id, e.target.value)}
                            >
                              <option value="">-- Select Progress --</option>
                              {progressOptions.map((status, i) => (
                                <option key={i} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </div>

                          {/* Chat Box */}
                          {isChatOpen && (
                            <div className="w-full mt-4 border rounded-lg p-4 bg-muted/20">
                              <ChatBox
                                alertId={alert._id}
                                currentUser={{
                                  _id: currentUserId,
                                  name: currentUserName,
                                }}
                                assignedUser={true}
                                progressStatus={alertProgress[alert._id] || ""}
                                setProgressStatus={(newStatus) => handleProgressChange(alert._id, newStatus)}
                                isChatOpen={isChatOpen}
                                onClose={() => setActiveChatAlertId(null)}
                              />
                            </div>
                          )}
                        </>
                      ) : (
                        <Badge variant="success" className="flex-1 justify-center py-2">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Task Assigned
                        </Badge>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    )
  }

  const handleAssignResponder = async (alertId, responderId) => {
    try {
      const token = localStorage.getItem("token")
      const endpoint = alertId.startsWith("user")
        ? `http://localhost:5000/api/user-alerts/assign/${alertId.replace("user_", "")}`
        : `http://localhost:5000/api/alerts/assign/${alertId}`

      await axios.post(endpoint, { responderId }, { headers: { Authorization: `Bearer ${token}` } })

      // Refresh data
      fetchAdminAlerts()
      fetchUserAlerts()
    } catch (err) {
      console.error("Failed to assign responder", err)
      toast.error("Failed to assign responder")
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading emergency alerts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-950/20 rounded-full">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">Emergency Alert Panel</span>
        </div>
        <h1 className="text-3xl font-bold">Emergency Alerts</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Monitor and respond to emergency alerts from administrators and community members
        </p>
      </div>

      {/* Tabs */}
      <div className="flex justify-center">
        <div className="flex space-x-1 bg-muted p-1 rounded-lg">
          <Button variant={activeTab === "admin" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("admin")}>
            Admin Alerts ({adminAlerts.length})
          </Button>
          <Button variant={activeTab === "user" ? "default" : "ghost"} size="sm" onClick={() => setActiveTab("user")}>
            User Alerts ({userAlerts.length})
          </Button>
        </div>
      </div>

      {/* Alerts Content */}
      {activeTab === "admin" ? renderAlerts(adminAlerts, "admin") : renderAlerts(userAlerts, "user")}

      {/* Map Modal */}
      {showMapModal && selectedAlert && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>Alert Location - {selectedAlert.incident}</span>
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={closeMapModal}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <CardDescription>{getLocationData(selectedAlert)?.address || "Location details"}</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 w-full">
                <div ref={mapRef} className="w-full h-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ResponderAlertsPage