"use client"

import { useState, useEffect, useRef } from "react"
import axios from "axios"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"
import { Bar, Line } from "react-chartjs-2"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
} from "chart.js"
import { Heart, Calendar, MapPin, Plus, Trash2, BarChart3, Download, Upload, Loader2, X } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Input } from "../../components/ui/Input"
import { Badge } from "../../components/ui/Badge"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement, BarElement)

const UserDetailsPage = () => {
  const [events, setEvents] = useState([])
  const [donations, setDonations] = useState([])
  const [form, setForm] = useState({ name: "", place: "", date: "" })
  const [poster, setPoster] = useState(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const analysisRef = useRef(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [eventRes, donationRes] = await Promise.all([
        axios.get("http://localhost:5000/api/events"),
        axios.get("http://localhost:5000/api/donations"),
      ])
      setEvents(eventRes.data || [])
      setDonations(donationRes.data || [])
    } catch (error) {
      console.error("Failed to fetch data:", error)
      setEvents([])
      setDonations([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    const formData = new FormData()
    formData.append("name", form.name)
    formData.append("place", form.place)
    formData.append("date", form.date)
    if (poster) formData.append("poster", poster)

    try {
      await axios.post("http://localhost:5000/api/events", formData)
      alert("Event added successfully!")
      setForm({ name: "", place: "", date: "" })
      setPoster(null)
      fetchData()
    } catch (error) {
      console.error("Error adding event:", error)
      alert("Error adding event")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this event?")) {
      try {
        await axios.delete(`http://localhost:5000/api/events/${id}`)
        fetchData()
      } catch (error) {
        console.error("Failed to delete event:", error)
        alert("Failed to delete event")
      }
    }
  }

  const exportPDF = async () => {
    setShowAnalysis(true)
    setTimeout(async () => {
      const element = analysisRef.current
      if (!element) return
      try {
        const canvas = await html2canvas(element)
        const imgData = canvas.toDataURL("image/png")
        const pdf = new jsPDF("p", "pt", "a4")
        pdf.addImage(imgData, "PNG", 10, 10, 580, 800)
        pdf.save("donation_report.pdf")
      } catch (error) {
        console.error("Error generating PDF:", error)
        alert("Failed to generate PDF")
      }
    }, 500)
  }

  // Analysis Data
  const totalDonation = donations.reduce((sum, d) => sum + (d.amount || 0), 0)
  const donationCount = donations.length
  const donationsByDate = donations.reduce((acc, d) => {
    const date = new Date(d.createdAt).toLocaleDateString()
    acc[date] = (acc[date] || 0) + (d.amount || 0)
    return acc
  }, {})
  const topDonors = donations.reduce((acc, d) => {
    acc[d.name] = (acc[d.name] || 0) + (d.amount || 0)
    return acc
  }, {})
  const sortedDonors = Object.entries(topDonors).sort((a, b) => b[1] - a[1])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-purple-100 dark:bg-purple-950/20 rounded-full">
          <Heart className="h-5 w-5 text-purple-600" />
          <span className="text-sm font-medium text-purple-700 dark:text-purple-400">Community Management</span>
        </div>
        <h1 className="text-3xl font-bold">Donations & Events</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage community donations and organize training events for emergency preparedness
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
            <Heart className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalDonation.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">From {donationCount} donors</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Training Events</CardTitle>
            <Calendar className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{events.length}</div>
            <p className="text-xs text-muted-foreground">Scheduled events</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow duration-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Donor</CardTitle>
            <Badge className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-bold">{sortedDonors[0]?.[0] || "N/A"}</div>
            <p className="text-xs text-muted-foreground">
              {sortedDonors[0] ? `₹${sortedDonors[0][1]}` : "No donations yet"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Donations Overview</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => setShowAnalysis(true)}>
            <BarChart3 className="h-4 w-4 mr-2" />
            View Analysis
          </Button>
          <Button variant="outline" onClick={exportPDF}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Donations</CardTitle>
          <CardDescription>All donations received for emergency relief efforts</CardDescription>
        </CardHeader>
        <CardContent>
          {donations.length === 0 ? (
            <div className="text-center py-12">
              <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No donations yet</h3>
              <p className="text-muted-foreground">Donations will appear here when received</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-4">Name</th>
                    <th className="text-left p-4">Email</th>
                    <th className="text-left p-4">Amount</th>
                    <th className="text-left p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((donation) => (
                    <tr key={donation._id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{donation.name}</td>
                      <td className="p-4 text-muted-foreground">{donation.email}</td>
                      <td className="p-4">
                        <Badge variant="success">₹{donation.amount}</Badge>
                      </td>
                      <td className="p-4 text-sm text-muted-foreground">
                        {new Date(donation.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Event Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>Add Training Event</span>
          </CardTitle>
          <CardDescription>Create new training events for emergency responders</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Name</label>
                <Input
                  placeholder="Emergency Response Training"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Training venue location"
                    value={form.place}
                    onChange={(e) => setForm({ ...form, place: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Event Poster</label>
                <div className="relative">
                  <Upload className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setPoster(e.target.files[0])}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding Event...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Event
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Events Grid */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Upcoming Training Events</h2>
        {events.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No events scheduled</h3>
              <p className="text-muted-foreground">Create your first training event above</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <Card key={event._id} className="hover:shadow-lg transition-shadow duration-200">
                <div className="relative">
                  <img
                    src={`http://localhost:5000/api/events/${event._id}/poster`}
                    alt={event.name}
                    className="w-full h-48 object-cover rounded-t-lg"
                    onError={(e) => {
                      e.target.src = "/placeholder.svg?height=200&width=300&text=Event+Poster"
                    }}
                  />
                  <div className="absolute top-2 right-2">
                    <Badge variant={new Date(event.date) > new Date() ? "success" : "secondary"}>
                      {new Date(event.date) > new Date() ? "Upcoming" : "Past"}
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <CardTitle className="line-clamp-2">{event.name}</CardTitle>
                  <CardDescription className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4" />
                      <span>{event.place}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Calendar className="h-4 w-4" />
                      <span>{new Date(event.date).toLocaleDateString()}</span>
                    </div>
                  </CardDescription>
                </CardHeader>

                <CardContent>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(event._id)} className="w-full">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Event
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Analysis Modal */}
      {showAnalysis && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div
            ref={analysisRef}
            className="bg-background w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl"
          >
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="text-2xl font-bold">Donation Analytics</h3>
              <Button variant="ghost" size="icon" onClick={() => setShowAnalysis(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 space-y-8">
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-purple-600">₹{totalDonation.toLocaleString()}</div>
                    <p className="text-sm text-muted-foreground">Total Donations</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-3xl font-bold text-green-600">{donationCount}</div>
                    <p className="text-sm text-muted-foreground">Number of Donors</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6 text-center">
                    <div className="text-2xl font-bold text-yellow-600">{sortedDonors[0]?.[0] || "N/A"}</div>
                    <p className="text-sm text-muted-foreground">
                      Top Donor {sortedDonors[0] ? `(₹${sortedDonors[0][1]})` : ""}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts */}
              {donations.length > 0 && (
                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Donations</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Bar
                        data={{
                          labels: Object.keys(donationsByDate),
                          datasets: [
                            {
                              label: "Daily Donations (₹)",
                              data: Object.values(donationsByDate),
                              backgroundColor: "rgba(139, 92, 246, 0.5)",
                              borderColor: "rgba(139, 92, 246, 1)",
                              borderWidth: 1,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                          },
                        }}
                      />
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Donation Trend</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Line
                        data={{
                          labels: Object.keys(donationsByDate),
                          datasets: [
                            {
                              label: "Donation Trend",
                              data: Object.values(donationsByDate),
                              borderColor: "rgba(34, 197, 94, 1)",
                              backgroundColor: "rgba(34, 197, 94, 0.1)",
                              tension: 0.3,
                              fill: true,
                            },
                          ],
                        }}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: "top",
                            },
                          },
                        }}
                      />
                    </CardContent>
                  </Card>
                </div>
              )}

              {/* Top Donors */}
              {sortedDonors.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top Donors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {sortedDonors.slice(0, 8).map(([name, amount], idx) => (
                        <div key={idx} className="bg-blue-50 dark:bg-blue-950/20 p-3 rounded-lg text-center">
                          <div className="font-semibold text-blue-700 dark:text-blue-400">{name}</div>
                          <div className="text-sm text-muted-foreground">₹{amount}</div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserDetailsPage
