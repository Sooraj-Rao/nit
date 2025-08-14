"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  AlertTriangle,
  MapPin,
  Plus,
  Edit,
  Trash2,
  Download,
  FileText,
  Search,
  Loader2,
  Users,
  Clock,
  X,
  Map,
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
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
};

const AddAlertPage = () => {
  const [incident, setIncident] = useState("");
  const [location, setLocation] = useState({
    lat: null,
    lng: null,
    address: "",
  });
  const [locationInput, setLocationInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [severity, setSeverity] = useState("Low");
  const [additionalDetails, setAdditionalDetails] = useState("");
  const [alerts, setAlerts] = useState([]);
  const [userAlerts, setUserAlerts] = useState([]);
  const [editingAlertId, setEditingAlertId] = useState(null);
  const [filterSeverity, setFilterSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [userFilterSeverity, setUserFilterSeverity] = useState("");
  const [userSearch, setUserSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeTab, setActiveTab] = useState("admin");
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);

  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const modalMapRef = useRef(null);
  const modalMapInstanceRef = useRef(null);
  const modalMarkerRef = useRef(null);

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

  // Initialize main form map
  useEffect(() => {
    if (mapRef.current && !mapInstanceRef.current) {
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
  }, []);

  // Initialize modal map when modal opens
  useEffect(() => {
    if (
      showMapModal &&
      selectedAlert &&
      modalMapRef.current &&
      !modalMapInstanceRef.current
    ) {
      const locationData = getLocationData(selectedAlert);
      if (locationData && locationData.lat && locationData.lng) {
        modalMapInstanceRef.current = L.map(modalMapRef.current).setView(
          [locationData.lat, locationData.lng],
          15
        );

        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(modalMapInstanceRef.current);

        modalMarkerRef.current = L.marker([locationData.lat, locationData.lng])
          .addTo(modalMapInstanceRef.current)
          .bindPopup(
            `
            <div>
              <strong>${selectedAlert.incident}</strong><br/>
              <small>${locationData.address}</small>
            </div>
          `
          )
          .openPopup();
      }
    }

    return () => {
      if (modalMapInstanceRef.current) {
        modalMapInstanceRef.current.remove();
        modalMapInstanceRef.current = null;
        modalMarkerRef.current = null;
      }
    };
  }, [showMapModal, selectedAlert]);

  const getLocationData = (alert) => {
    try {
      if (alert.place) {
        return typeof alert.place === "string"
          ? JSON.parse(alert.place)
          : alert.place;
      } else if (alert.location) {
        return typeof alert.location === "string"
          ? JSON.parse(alert.location)
          : alert.location;
      }
      return null;
    } catch (error) {
      console.error("Error parsing location data:", error);
      return null;
    }
  };

  const handleViewOnMap = (alert) => {
    const locationData = getLocationData(alert);
    if (locationData && locationData.lat && locationData.lng) {
      setSelectedAlert(alert);
      setShowMapModal(true);
    } else {
      alert("Location data not available for this alert");
    }
  };

  const closeMapModal = () => {
    setShowMapModal(false);
    setSelectedAlert(null);
    if (modalMapInstanceRef.current) {
      modalMapInstanceRef.current.remove();
      modalMapInstanceRef.current = null;
      modalMarkerRef.current = null;
    }
  };

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
      lat: Number.parseFloat(lat),
      lng: Number.parseFloat(lon),
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

  const fetchAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/alerts", {
        headers: { Authorization: `Bearer ${token}` },
        params: { severity: filterSeverity, search, page, limit: 4 },
      });
      const alertsData = (res.data.alerts || []).map((alert) => ({
        ...alert,
        location:
          typeof alert.place === "string"
            ? JSON.parse(alert.place)
            : alert.place,
      }));
      setAlerts(alertsData);
      setTotalPages(Math.ceil(res.data.total / 4));
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAlerts = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/user-alerts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = Array.isArray(res.data?.alerts)
        ? res.data.alerts
        : Array.isArray(res.data)
        ? res.data
        : [];
      const parsedData = data.map((a) => ({
        ...a,
        isUser: true,
        location:
          typeof a.location === "string" ? JSON.parse(a.location) : a.location,
      }));
      setUserAlerts(parsedData);
    } catch (err) {
      console.error("Error fetching user alerts:", err);
      setUserAlerts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, [filterSeverity, search, page]);

  useEffect(() => {
    fetchUserAlerts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");
    const payload = {
      incident,
      place: JSON.stringify({
        lat: location.lat,
        lng: location.lng,
        address: location.address,
      }),
      severity,
      additionalDetails,
    };

    try {
      if (editingAlertId) {
        await axios.put(
          `http://localhost:5000/api/alerts/${editingAlertId}`,
          payload,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        alert("Alert updated successfully");
        setEditingAlertId(null);
      } else {
        await axios.post("http://localhost:5000/api/alerts", payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
        alert("Alert added successfully");
      }

      // Reset form
      setIncident("");
      setLocation({ lat: null, lng: null, address: "" });
      setLocationInput("");
      setSeverity("Low");
      setAdditionalDetails("");
      setSuggestions([]);
      handleClear();
      fetchAlerts();
    } catch (err) {
      console.error("Alert operation failed", err);
      alert("Failed to process alert");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (alert) => {
    setEditingAlertId(alert._id);
    setIncident(alert.incident);
    setLocation(alert.location || { lat: null, lng: null, address: "" });
    setLocationInput(alert.location?.address || "");
    setSeverity(alert.severity);
    setAdditionalDetails(alert.additionalDetails);
    if (alert.location && mapInstanceRef.current) {
      mapInstanceRef.current.setView(
        [alert.location.lat, alert.location.lng],
        15
      );
      if (markerRef.current) {
        markerRef.current.setLatLng([alert.location.lat, alert.location.lng]);
      } else {
        markerRef.current = L.marker([
          alert.location.lat,
          alert.location.lng,
        ]).addTo(mapInstanceRef.current);
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this alert?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/alerts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Alert deleted");
      fetchAlerts();
    } catch (err) {
      console.error("Failed to delete alert", err);
      alert("Failed to delete alert");
    }
  };

  const handleAssignResponder = async (alertId, responderId) => {
    try {
      const token = localStorage.getItem("token");
      const endpoint = alertId.startsWith("user")
        ? `http://localhost:5000/api/user-alerts/assign/${alertId.replace(
            "user_",
            ""
          )}`
        : `http://localhost:5000/api/alerts/assign/${alertId}`;

      await axios.post(
        endpoint,
        { responderId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Responder assigned successfully");
      fetchAlerts();
      fetchUserAlerts();
    } catch (err) {
      console.error("Failed to assign responder", err);
      alert("Failed to assign responder");
    }
  };

  const exportToCSV = () => {
    const dataToExport = activeTab === "admin" ? alerts : userAlerts;
    if (!dataToExport.length) return;

    const header = [
      "Incident",
      "Address",
      "Coordinates",
      "Severity",
      "Details",
      "Created",
    ];
    const rows = dataToExport.map((alert) => [
      alert.incident,
      alert.location?.address || alert.place?.address || "N/A",
      alert.location?.lat && alert.location?.lng
        ? `(${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)})`
        : alert.place?.lat && alert.place?.lng
        ? `(${alert.place.lat.toFixed(4)}, ${alert.place.lng.toFixed(4)})`
        : "N/A",
      alert.severity,
      alert.additionalDetails || alert.description || "N/A",
      new Date(alert.createdAt).toLocaleString(),
    ]);

    const csv = [header, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", "alerts.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const dataToExport = activeTab === "admin" ? alerts : userAlerts;
    const headers = [
      "Incident",
      "Address",
      "Coordinates",
      "Severity",
      "Details",
      "Created",
    ];
    const data = dataToExport.map((alert) => [
      alert.incident,
      alert.location?.address || "N/A",
      alert.location?.lat && alert.location?.lng
        ? `(${alert.location.lat.toFixed(4)}, ${alert.location.lng.toFixed(4)})`
        : "N/A",
      alert.severity,
      alert.additionalDetails || alert.description || "N/A",
      new Date(alert.createdAt).toLocaleString(),
    ]);

    autoTable(doc, { head: [headers], body: data, startY: 20 });
    doc.text("Emergency Alerts", 14, 15);
    doc.save("alerts.pdf");
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Low":
        return "success";
      case "Moderate":
        return "warning";
      case "High":
        return "destructive";
      case "Critical":
        return "destructive";
      default:
        return "secondary";
    }
  };

  // Filter user alerts based on search and severity
  const filteredUserAlerts = userAlerts.filter((alert) => {
    const matchesSearch =
      alert.incident?.toLowerCase().includes(userSearch.toLowerCase()) ||
      alert.location?.address
        ?.toLowerCase()
        .includes(userSearch.toLowerCase()) ||
      (alert.additionalDetails || alert.description || "")
        .toLowerCase()
        .includes(userSearch.toLowerCase());

    const matchesSeverity =
      userFilterSeverity === "" || alert.severity === userFilterSeverity;

    return matchesSearch && matchesSeverity;
  });

  console.log('admin alets',alerts)
  console.log('user alets',userAlerts)

  const renderAlertCard = (alert) => (
    <Card
      key={alert._id}
      className="hover:shadow-lg transition-shadow duration-200"
    >
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-primary" />
            <span>{alert.incident}</span>
            {alert.isUser && (
              <Badge variant="outline" className="text-xs">
                User Alert
              </Badge>
            )}
          </CardTitle>
          <Badge variant={getSeverityColor(alert.severity)}>
            {alert.severity}
          </Badge>
        </div>
        <CardDescription>
          Reported on {new Date(alert.createdAt).toLocaleDateString()}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2 flex-1">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">Address:</span>
              <span className="truncate">
                {alert.location?.address || alert.place?.address || "N/A"}
              </span>
            </div>
          </div>
            {
              (alert.location?.lat && alert.location?.lng && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewOnMap(alert)}
                  className="ml-2 flex-shrink-0"
                >
                  <Map className="h-3 w-3 mr-1" />
                  View
                </Button>
              ))}


          {(alert.additionalDetails || alert.description) && (
            <div className="text-sm">
              <span className="font-medium">Details:</span>
              <p className="text-muted-foreground mt-1">
                {alert.additionalDetails || alert.description}
              </p>
            </div>
          )}
        </div>

        {/* Responders Section */}
        {(alert.responders?.length > 0 || alert.users?.length > 0) && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm font-medium">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span>Responders:</span>
            </div>
            <div className="space-y-1">
              {(alert.responders || alert.users || []).map((r, i) => {
                const user = r?.user || r;
                const assignedId =
                  alert.assignedResponder?._id || alert.assignedResponder;
                const isAssigned =
                  assignedId?.toString() === user?._id?.toString();

                return (
                  <div
                    key={i}
                    className="flex items-center justify-between text-sm p-2 bg-muted/50 rounded"
                  >
                    <div>
                      <span className="font-medium">
                        {user?.name || "Unknown"}
                      </span>
                      <span className="text-muted-foreground ml-2">
                        ({user?.email || "N/A"})
                      </span>
                      <div className="text-xs text-muted-foreground flex items-center space-x-1 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {new Date(
                            r.respondedAt || alert.createdAt
                          ).toLocaleString()}
                        </span>
                      </div>
                    </div>
                    {isAssigned ? (
                      <Badge variant="success" className="text-xs">
                        Assigned
                      </Badge>
                    ) : !assignedId ? (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          handleAssignResponder(
                            alert.isUser ? `user_${alert._id}` : alert._id,
                            user._id
                          )
                        }
                      >
                        Assign
                      </Button>
                    ) : (
                      <Badge variant="secondary" className="text-xs">
                        Available
                      </Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        {!alert.isUser && (
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(alert)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(alert._id)}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-red-100 dark:bg-red-950/20 rounded-full">
          <AlertTriangle className="h-5 w-5 text-red-600" />
          <span className="text-sm font-medium text-red-700 dark:text-red-400">
            Alert Management
          </span>
        </div>
        <h1 className="text-3xl font-bold">
          {editingAlertId ? "Edit Alert" : "Add New Alert"}
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create and manage emergency alerts to coordinate response efforts
          effectively
        </p>
      </div>

      {/* Alert Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5" />
            <span>
              {editingAlertId
                ? "Edit Emergency Alert"
                : "Create Emergency Alert"}
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Incident Type</label>
                <Input
                  placeholder="e.g., Fire, Medical Emergency, Flood"
                  value={incident}
                  onChange={(e) => setIncident(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Severity Level</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full p-3 border rounded-md bg-background"
                >
                  <option value="Low">Low</option>
                  <option value="Moderate">Moderate</option>
                  <option value="High">High</option>
                  <option value="Critical">Critical</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter location (e.g., Bantwal)"
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
                        onMouseDown={() => handleSuggestionSelect(suggestion)}
                        className="p-2 hover:bg-muted cursor-pointer text-sm"
                      >
                        {suggestion.display_name}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="h-64 rounded-lg overflow-hidden border">
                <div ref={mapRef} className="w-full z-[9] h-full" />
              </div>

              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  {location.address
                    ? `Selected: ${location.address}`
                    : "Enter a location or click on the map"}
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
              <label className="text-sm font-medium">Additional Details</label>
              <textarea
                placeholder="Provide additional information about the emergency..."
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                className="w-full p-3 border rounded-md bg-background min-h-[100px]"
              />
            </div>

            <Button
              type="submit"
              disabled={!location.lat || !location.lng || submitting}
              className="w-full"
              size="lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {editingAlertId ? "Updating Alert..." : "Creating Alert..."}
                </>
              ) : (
                <>
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  {editingAlertId ? "Update Alert" : "Create Alert"}
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Alerts Management */}
      <div className="space-y-6">
        {/* Tabs and Export */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-1 bg-muted p-1 rounded-lg">
            <Button
              variant={activeTab === "admin" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("admin")}
            >
              Admin Alerts ({alerts.length})
            </Button>
            <Button
              variant={activeTab === "user" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("user")}
            >
              User Alerts ({userAlerts.length})
            </Button>
          </div>

          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={exportToCSV}>
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={exportToPDF}>
              <FileText className="h-4 w-4 mr-2" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters for both Admin and User alerts */}
        <Card className='pt-6'>
          <CardContent className="p-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder={`Search ${activeTab} alerts...`}
                    value={activeTab === "admin" ? search : userSearch}
                    onChange={(e) =>
                      activeTab === "admin"
                        ? setSearch(e.target.value)
                        : setUserSearch(e.target.value)
                    }
                    className="pl-10"
                  />
                </div>
              </div>
              <select
                value={
                  activeTab === "admin" ? filterSeverity : userFilterSeverity
                }
                onChange={(e) =>
                  activeTab === "admin"
                    ? setFilterSeverity(e.target.value)
                    : setUserFilterSeverity(e.target.value)
                }
                className="px-3 py-2 border rounded-md bg-background"
              >
                <option value="">All Severities</option>
                <option value="Low">Low</option>
                <option value="Moderate">Moderate</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
              <p className="text-muted-foreground">Loading alerts...</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeTab === "admin" ? (
              alerts.length > 0 ? (
                alerts.map(renderAlertCard)
              ) : (
                <Card className="col-span-full">
                  <CardContent className="p-12 text-center">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">
                      No admin alerts found
                    </h3>
                    <p className="text-muted-foreground">
                      {search || filterSeverity
                        ? "Try adjusting your search or filter criteria"
                        : "Create your first emergency alert above"}
                    </p>
                  </CardContent>
                </Card>
              )
            ) : filteredUserAlerts.length > 0 ? (
              filteredUserAlerts.map(renderAlertCard)
            ) : (
              <Card className="col-span-full">
                <CardContent className="p-12 text-center">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">
                    No user alerts found
                  </h3>
                  <p className="text-muted-foreground">
                    {userSearch || userFilterSeverity
                      ? "Try adjusting your search or filter criteria"
                      : "No user-reported alerts at the moment"}
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Pagination for Admin Alerts */}
        {activeTab === "admin" && totalPages > 1 && (
          <div className="flex items-center justify-center space-x-4">
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.max(p - 1, 1))}
              disabled={page === 1}
            >
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="outline"
              onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
              disabled={page === totalPages}
            >
              Next
            </Button>
          </div>
        )}
      </div>

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
              <CardDescription>
                <div className="space-y-1">
                  <p>
                    {getLocationData(selectedAlert)?.address ||
                      "Location details"}
                  </p>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="h-96 w-full">
                <div ref={modalMapRef} className="w-full h-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default AddAlertPage;
