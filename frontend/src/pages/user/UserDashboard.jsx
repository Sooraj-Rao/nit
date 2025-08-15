import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import ChatBox from "../../components/ChatBox";
import {
  User,
  X,
  MapPin,
  AlertTriangle,
  Phone,
  Mail,
  Edit,
  Trash2,
  MessageCircle,
  Navigation,
  Shield,
  Heart,
  Home,
  FileText,
  Bell,
  Gift,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";

// Fix for Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom debounce function
const debounce = (func, delay) => {
  let timeout;
  return function (...args) {
    const context = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(context, args), delay);
  };
};

const UserDashboard = () => {
  const [incident, setIncident] = useState("");
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [severity, setSeverity] = useState("");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [user, setUser] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [editData, setEditData] = useState({
    incident: "",
    location: "",
    severity: "",
    description: "",
  });
  const [activeGuide, setActiveGuide] = useState(null);
  const [activeChatAlertId, setActiveChatAlertId] = useState(null);
  const [activeTrackAlertId, setActiveTrackAlertId] = useState(null);
  const [progressMap, setProgressMap] = useState({});
  const [activeSection, setActiveSection] = useState("home");

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const token = localStorage.getItem("token");
  const BASE_URL = "http://localhost:5000/api";

  // Fetch suggestions with useCallback
  const fetchSuggestions = useCallback(async (query) => {
    if (!query || query.length < 2) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          query
        )}&limit=5`
      );
      setSuggestions(response.data || []);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
      setSuggestions([]);
    }
  }, []);

  // Debounced fetch suggestions
  const debouncedFetchSuggestions = useCallback(
    debounce(fetchSuggestions, 500),
    [fetchSuggestions]
  );

  // Initialize map
  useEffect(() => {
    if (
      mapRef.current &&
      !mapInstanceRef.current &&
      activeSection === "report"
    ) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [12.8877, 74.8424],
        13
      );
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(mapInstanceRef.current);

      mapInstanceRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setLocation({ lat, lng, address: "Selected on map" });
        setLocationInput("Selected on map");
        setSuggestions([]);
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng]).addTo(
            mapInstanceRef.current
          );
        }
        fetchAddress(lat, lng);
      });
    }

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [activeSection]);

  // Reverse geocode coordinates to address
  const fetchAddress = async (lat, lng) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      );
      const address = response.data.display_name;
      setLocation((prev) => ({ ...prev, address }));
      setLocationInput(address);
      setSuggestions([]);
    } catch (error) {
      console.error("Error fetching address:", error);
      setLocation((prev) => ({ ...prev, address: "Address not found" }));
      setLocationInput("Address not found");
    }
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    const { lat, lon, display_name } = suggestion;
    setLocation({
      lat: parseFloat(lat),
      lng: parseFloat(lon),
      address: display_name,
    });
    setLocationInput(display_name);
    setSuggestions([]);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([lat, lon], 15);
      if (markerRef.current) {
        markerRef.current.setLatLng([lat, lon]);
      } else {
        markerRef.current = L.marker([lat, lon]).addTo(mapInstanceRef.current);
      }
    }
  };

  // Handle clear button
  const handleClear = () => {
    setLocationInput("");
    setLocation({ lat: null, lng: null, address: "" });
    setSuggestions([]);
    if (markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.setView([12.8877, 74.8424], 13);
    }
  };

  const handleAddAlert = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `${BASE_URL}/user-alerts`,
        {
          incident,
          location: JSON.stringify({
            lat: location.lat,
            lng: location.lng,
            address: location.address,
          }),
          severity,
          description: additionalDetails,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success("Emergency reported successfully!");
      setIncident("");
      setLocation({ lat: null, lng: null, address: "" });
      setLocationInput("");
      setSeverity("");
      setAdditionalDetails("");
      setSuggestions([]);
      if (markerRef.current) {
        mapInstanceRef.current.removeLayer(markerRef.current);
        markerRef.current = null;
      }
      if (mapInstanceRef.current) {
        mapInstanceRef.current.setView([12.8877, 74.8424], 13);
      }
      fetchUserAlerts();
    } catch (err) {
      toast.error("Failed to report emergency");
    }
  };

  const fetchUserAlerts = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/user-alerts/my-alerts`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data.map((alert) => ({
        ...alert,
        location:
          typeof alert.location === "string"
            ? JSON.parse(alert.location)
            : alert.location,
      }));
      setAlerts(data);
      const prog = {};
      data.forEach((a) => {
        if (a._id && a.progressStatus !== undefined)
          prog[a._id] = a.progressStatus;
      });
      setProgressMap(prog);
    } catch (err) {
      setAlerts([]);
    }
  };

  const fetchUserDetails = async () => {
    try {
      const res = await axios.get(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUserAlerts();
    fetchUserDetails();
  }, []);

  const fetchProgress = async (alertId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/user-alerts/${alertId}/progress`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setProgressMap((prev) => ({
        ...prev,
        [alertId]: res.data.progressStatus,
      }));
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this alert?")) {
      try {
        await axios.delete(`${BASE_URL}/user-alerts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        fetchUserAlerts();
      } catch (err) {
        toast.error("Failed to delete");
      }
    }
  };

  const handleEdit = (alert) => {
    setEditingAlertId(alert._id);
    setEditData({
      incident: alert.incident,
      location:
        typeof alert.location === "string"
          ? alert.location
          : JSON.stringify(alert.location),
      severity: alert.severity,
      description: alert.description,
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/user-alerts/${editingAlertId}`, editData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEditingAlertId(null);
      fetchUserAlerts();
    } catch (err) {
      toast.error("Failed to update alert");
    }
  };

  const emergencyGuides = [
    {
      type: "Fire",
      emoji: "🔥",
      summary: "Evacuate immediately, call 101.",
      details: [
        { icon: "🚪", text: "Leave the building immediately using stairs." },
        { icon: "🚫", text: "Do NOT use elevators during a fire." },
        { icon: "📞", text: "Call fire services at 101 immediately." },
        {
          icon: "🧯",
          text: "Use a fire extinguisher only if safe and trained.",
        },
        { icon: "👥", text: "Assist others and alert people nearby." },
      ],
    },
    {
      type: "Medical",
      emoji: "🚑",
      summary: "Call 108. Stay calm and explain the situation.",
      details: [
        { icon: "📞", text: "Call 108 and clearly explain the emergency." },
        { icon: "🧍", text: "Stay with the injured person, reassure them." },
        { icon: "🩹", text: "Provide first aid if trained." },
        { icon: "🧼", text: "Ensure hygiene and avoid contamination." },
        { icon: "🚫", text: "Don't move the victim unless necessary." },
      ],
    },
    {
      type: "Flood",
      emoji: "🌊",
      summary: "Move to higher ground. Disconnect power.",
      details: [
        { icon: "⛰️", text: "Move to higher ground immediately." },
        { icon: "💡", text: "Turn off electricity and gas supply." },
        { icon: "🚪", text: "Close doors and windows tightly." },
        { icon: "🧳", text: "Take emergency supplies and documents." },
        { icon: "🚫", text: "Avoid walking or driving through floodwaters." },
      ],
    },
    {
      type: "Earthquake",
      emoji: "🌍",
      summary: "Take cover under sturdy furniture.",
      details: [
        { icon: "🤲", text: "Drop to the ground and take cover." },
        { icon: "🪑", text: "Get under sturdy furniture like a desk." },
        { icon: "🛑", text: "Stay indoors until the shaking stops." },
        { icon: "🚷", text: "Avoid windows, glass, and heavy objects." },
        { icon: "📢", text: "After shaking, move to open space cautiously." },
      ],
    },
  ];

  const navigationItems = [
    { id: "home", label: "Home", icon: Home },
    { id: "report", label: "Report Emergency", icon: AlertTriangle },
    { id: "guide", label: "Safety Guide", icon: Shield },
    { id: "alerts", label: "My Alerts", icon: Bell },
    { id: "donation", label: "Donate", icon: Gift },
  ];
const renderProgressBar = (alertId) => {
  const stages = [
    { label: "Dispatched", icon: "🚒" },
    { label: "On the Way", icon: "🛣️" },
    { label: "Arrived", icon: "📍" },
    { label: "Handling Incident", icon: "🧑‍🚒" },
    { label: "Resolved", icon: "✅" },
  ];

  const current = progressMap[alertId] || "Dispatched";
  const curIdx = stages.findIndex((s) => s.label === current);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-6">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Navigation className="h-5 w-5 text-primary" />
              <span>Emergency Progress Tracking</span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setActiveTrackAlertId(null)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between space-x-4">
            {stages.map((stage, idx) => {
              const isActive = idx === curIdx;
              const isCompleted = idx < curIdx;

              return (
                <div
                  key={idx}
                  className="relative flex-1 flex flex-col items-center transition-all"
                >
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full text-2xl border-2 transition-colors duration-300 ${
                      isCompleted
                        ? "bg-green-500 text-white border-green-600"
                        : isActive
                        ? "bg-primary text-primary-foreground border-primary animate-pulse"
                        : "bg-muted text-muted-foreground border-muted"
                    }`}
                  >
                    {stage.icon}
                  </div>
                  <span className="text-xs mt-2 text-center w-24">
                    {stage.label}
                  </span>
                  {idx < stages.length - 1 && (
                    <div className="absolute top-6 left-[85%] w-32">
                      <div
                        className={`h-1 transition-all duration-300 ${
                          isCompleted ? "bg-green-500" : "bg-muted"
                        }`}
                        style={{
                          marginLeft: "25px",
                          width: "calc(100% - 50px)",
                          transform: "translateX(-50%)",
                        }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};


  const renderContent = () => {
    switch (activeSection) {
      case "home":
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold">
                Welcome to Emergency Portal
              </h1>
              <p className="text-xl text-muted-foreground">
                Your safety is our priority. Report emergencies and get help
                when you need it most.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <button onClick={() => setActiveSection("report")}>
                <Card className="hover:shadow-lg pt-6 transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <AlertTriangle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Report Emergency</h3>
                    <p className="text-sm text-muted-foreground">
                      Quickly report emergencies and get immediate help
                    </p>
                  </CardContent>
                </Card>
              </button>
              <button onClick={() => setActiveSection("guide")}>
                <Card className="hover:shadow-lg pt-6 transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <Shield className="h-8 w-8 text-blue-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Safety Guide</h3>
                    <p className="text-sm text-muted-foreground">
                      Learn how to handle different emergency situations
                    </p>
                  </CardContent>
                </Card>
              </button>
              <button onClick={() => setActiveSection("alerts")}>
                <Card className="hover:shadow-lg pt-6 transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <Bell className="h-8 w-8 text-green-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Track Alerts</h3>
                    <p className="text-sm text-muted-foreground">
                      Monitor your reported emergencies and their status
                    </p>
                  </CardContent>
                </Card>
              </button>
              <button onClick={() => setActiveSection("donation")}>
                <Card className="hover:shadow-lg pt-6 transition-shadow duration-200">
                  <CardContent className="p-6 text-center">
                    <Heart className="h-8 w-8 text-purple-500 mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Support Relief</h3>
                    <p className="text-sm text-muted-foreground">
                      Donate to help emergency response efforts and people
                    </p>
                  </CardContent>
                </Card>
              </button>
            </div>
          </div>
        );

      case "report":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-red-600 mb-2">
                Report an Emergency
              </h2>
              <p className="text-muted-foreground">
                Provide detailed information to help responders assist you
                quickly
              </p>
            </div>

            <Card>
              <CardContent className="p-8">
                <form onSubmit={handleAddAlert} className="space-y-6 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Type of Emergency
                      </label>
                      <Input
                        placeholder="e.g., Fire, Medical, Flood..."
                        value={incident}
                        onChange={(e) => setIncident(e.target.value)}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        Severity Level
                      </label>
                      <select
                        value={severity}
                        onChange={(e) => setSeverity(e.target.value)}
                        className="w-full p-3 text-sm rounded-md border border-input bg-background"
                        required
                      >
                        <option value="">Select Severity</option>
                        <option value="Low">🟢 Low</option>
                        <option value="Moderate">🟡 Moderate</option>
                        <option value="High">🟠 High</option>
                        <option value="Critical">🔴 Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Location</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Enter location or click on map"
                        value={locationInput}
                        onChange={(e) => {
                          setLocationInput(e.target.value);
                          debouncedFetchSuggestions(e.target.value);
                        }}
                        onBlur={() => setTimeout(() => setSuggestions([]), 200)}
                        className="pl-10"
                        autoComplete="off"
                      />
                      {suggestions.length > 0 && (
                        <div className="absolute z-10 w-full bg-background border border-border rounded-md mt-1 max-h-48 overflow-y-auto">
                          {suggestions.map((suggestion, index) => (
                            <div
                              key={index}
                              onMouseDown={() =>
                                handleSuggestionSelect(suggestion)
                              }
                              className="p-2 hover:bg-muted cursor-pointer text-sm"
                            >
                              {suggestion.display_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="h-64  rounded-lg overflow-hidden border">
                      <div ref={mapRef} className="w-full h-full z-[1]" />
                    </div>

                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>
                        {location.address
                          ? `Selected: ${location.address}`
                          : "Click on map to select location"}
                      </span>
                      {location.lat && location.lng && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleClear}
                        >
                          Clear
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Additional Details
                    </label>
                    <textarea
                      placeholder="Provide any additional information that might help responders..."
                      value={additionalDetails}
                      onChange={(e) => setAdditionalDetails(e.target.value)}
                      className="w-full p-3 rounded-md border border-input bg-background min-h-[100px]"
                    />
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
                    size="lg"
                    disabled={!location.lat || !location.lng}
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Submit Emergency Report
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        );

      case "guide":
        return (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">
                Emergency Safety Guide
              </h2>
              <p className="text-muted-foreground">
                Learn how to respond to different emergency situations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {emergencyGuides.map((guide, index) => (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  onClick={() => setActiveGuide(guide)}
                >
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3">
                      <span className="text-2xl">{guide.emoji}</span>
                      <span>{guide.type} Emergency</span>
                    </CardTitle>
                    <CardDescription>{guide.summary}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            {activeGuide && (
              <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50 p-4">
                <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center space-x-2">
                        <span className="text-2xl">{activeGuide.emoji}</span>
                        <span>{activeGuide.type} Emergency Guide</span>
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveGuide(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {activeGuide.details.map((step, index) => (
                        <div
                          key={index}
                          className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
                        >
                          <span className="text-lg">{step.icon}</span>
                          <span className="text-sm">{step.text}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        );

      case "alerts":
        return (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-2">My Emergency Alerts</h2>
              <p className="text-muted-foreground">
                Track the status of your reported emergencies
              </p>
            </div>

            {alerts.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No alerts reported yet
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    When you report an emergency, it will appear here
                  </p>
                  <Button onClick={() => setActiveSection("report")}>
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Report Emergency
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {alerts.map((alert) => (
                  <Card
                    key={alert._id}
                    className="hover:shadow-lg transition-shadow duration-200"
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          {alert.incident}
                        </CardTitle>
                        <Badge
                          variant={
                            alert.severity === "Critical"
                              ? "destructive"
                              : alert.severity === "High"
                              ? "warning"
                              : alert.severity === "Moderate"
                              ? "secondary"
                              : "success"
                          }
                        >
                          {alert.severity}
                        </Badge>
                      </div>
                      <CardDescription>{alert.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      {editingAlertId === alert._id ? (
                        <form onSubmit={handleUpdate} className="space-y-3">
                          <Input
                            value={editData.incident}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                incident: e.target.value,
                              })
                            }
                            placeholder="Incident"
                            required
                          />
                          <Input
                            value={JSON.parse(editData.location).address}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                location: JSON.stringify({
                                  ...JSON.parse(editData.location),
                                  address: e.target.value,
                                }),
                              })
                            }
                            placeholder="Location"
                            required
                          />
                          <select
                            value={editData.severity}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                severity: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded-md border border-input bg-background"
                            required
                          >
                            <option value="">Select Severity</option>
                            <option value="Low">Low</option>
                            <option value="Moderate">Moderate</option>
                            <option value="High">High</option>
                            <option value="Critical">Critical</option>
                          </select>
                          <textarea
                            value={editData.description}
                            onChange={(e) =>
                              setEditData({
                                ...editData,
                                description: e.target.value,
                              })
                            }
                            className="w-full p-2 rounded-md border border-input bg-background"
                            placeholder="Description"
                          />
                          <div className="flex space-x-2">
                            <Button type="submit" size="sm" className="flex-1">
                              Update
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingAlertId(null)}
                              className="flex-1"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span>{alert.location.address}</span>
                          </div>

                          {alert.assignedResponder ? (
                            <div className="p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                              <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                Assigned to: {alert.assignedResponder.name}
                              </p>
                            </div>
                          ) : (
                            <p className=" text-sm text-yellow-500">
                              No one responded yet.
                            </p>
                          )}

                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(alert)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(alert._id)}
                            >
                              <Trash2 className="h-3 w-3 mr-1" />
                              Delete
                            </Button>
                            {alert.assignedResponder && (
                              <>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() =>
                                    setActiveChatAlertId(alert._id)
                                  }
                                >
                                  <MessageCircle className="h-3 w-3 mr-1" />
                                  Chat
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    setActiveTrackAlertId(alert._id);
                                    fetchProgress(alert._id);
                                  }}
                                >
                                  <Navigation className="h-3 w-3 mr-1" />
                                  Track
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {activeChatAlertId && (
              <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>Emergency Chat</CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setActiveChatAlertId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <ChatBox alertId={activeChatAlertId} currentUser={user} />
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTrackAlertId && renderProgressBar(activeTrackAlertId)}
          </div>
        );

      case "donation":
        window.location.href = "/donation";
        return null;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-secondary/5">
      {/* Navigation */}
      <nav className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.id}
                    variant={activeSection === item.id ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      if (item.id === "donation") {
                        window.location.href = "/donation";
                      } else {
                        setActiveSection(item.id);
                      }
                    }}
                    className="flex items-center space-x-2"
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </Button>
                );
              })}
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowProfile(!showProfile)}
            >
              <User className="h-4 w-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </nav>

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5" />
                  <span>Your Profile</span>
                </CardTitle>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfile(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Name:</span>
                    <span>{user.name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Phone:</span>
                    <span>{user.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>{user.place}</span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground">
                  Loading profile...
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8 ">{renderContent()}</div>
    </div>
  );
};

export default UserDashboard;