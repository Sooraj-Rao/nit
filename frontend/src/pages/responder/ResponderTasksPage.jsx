"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Calendar,
  MapPin,
  Search,
  Download,
  Share,
  X,
  Loader2,
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

const ResponderTasksPage = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDate, setSelectedDate] = useState("");
  const [sortOrder, setSortOrder] = useState("upcoming");
  const [viewImageUrl, setViewImageUrl] = useState("");
  const [currentIndex, setCurrentIndex] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        const res = await axios.get("http://localhost:5000/api/events");
        setEvents(res.data || []);
        setFilteredEvents(res.data || []);
      } catch (error) {
        console.error("Failed to fetch events:", error);
        setEvents([]);
        setFilteredEvents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  useEffect(() => {
    let filtered = [...events];

    if (searchTerm) {
      filtered = filtered.filter(
        (event) =>
          event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          event.place.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDate) {
      filtered = filtered.filter(
        (event) =>
          new Date(event.date).toISOString().slice(0, 10) === selectedDate
      );
    }

    filtered.sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      return sortOrder === "upcoming" ? dateA - dateB : dateB - dateA;
    });

    setFilteredEvents(filtered);
  }, [searchTerm, selectedDate, sortOrder, events]);

  const isUpcoming = (date) => new Date(date) > new Date();

  const handleShare = async (event) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/events/${event._id}/poster`
      );
      const blob = await response.blob();
      const file = new File([blob], `${event.name}.jpg`, { type: blob.type });

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: event.name,
          text: `📅 ${new Date(event.date).toLocaleDateString()} | 📍 ${
            event.place
          }`,
          files: [file],
        });
      } else {
        // Fallback: copy to clipboard or show share options
        const url = `http://localhost:5000/api/events/${event._id}/poster`;
        await navigator.clipboard.writeText(
          `Check out this training event: ${event.name} at ${
            event.place
          } on ${new Date(event.date).toLocaleDateString()}. Poster: ${url}`
        );
        alert("Event details copied to clipboard!");
      }
    } catch (err) {
      console.error("Sharing failed:", err);
      alert("Failed to share. Please try again.");
    }
  };

  const handleDownload = (event) => {
    const link = document.createElement("a");
    link.href = `http://localhost:5000/api/events/${event._id}/poster`;
    link.download = `${event.name.replace(/\s+/g, "-")}-poster.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading training events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-100 dark:bg-blue-950/20 rounded-full">
          <Calendar className="h-5 w-5 text-blue-600" />
          <span className="text-sm font-medium text-blue-700 dark:text-blue-400">
            Training Events
          </span>
        </div>
        <h1 className="text-3xl font-bold">Emergency Response Training</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Stay updated with the latest responder training sessions and
          certification programs
        </p>
      </div>

      {/* Filters */}
      <Card className=" pt-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by event name or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {(searchTerm || selectedDate) && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredEvents.length} of {events.length} events
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchTerm("");
                  setSelectedDate("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              No training events found
            </h3>
            <p className="text-muted-foreground">
              {events.length === 0
                ? "No training events have been scheduled yet"
                : "Try adjusting your search criteria"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => (
            <Card
              key={event._id}
              className="hover:shadow-lg transition-shadow duration-200"
            >
              <div className="relative">
                <img
                  src={`http://localhost:5000/api/events/${event._id}/poster`}
                  alt={event.name}
                  className="w-full h-48 object-cover rounded-t-lg cursor-pointer hover:opacity-90 transition-opacity"
                  onClick={() => {
                    setViewImageUrl(
                      `http://localhost:5000/api/events/${event._id}/poster`
                    );
                    setCurrentIndex(index);
                  }}
                />
                <div className="absolute top-2 left-2">
                  <Badge
                    variant={isUpcoming(event.date) ? "success" : "secondary"}
                  >
                    {isUpcoming(event.date) ? "Upcoming" : "Past"}
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
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleShare(event)}
                    className="flex-1"
                  >
                    <Share className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDownload(event)}
                    className="flex-1"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Image Modal */}
      {viewImageUrl && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setViewImageUrl("")}
        >
          <div className="relative bg-background rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="sticky top-0 bg-background border-b p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">Training Event Poster</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setViewImageUrl("")}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4">
              <img
                src={viewImageUrl || "/placeholder.svg"}
                alt="Training Event Poster"
                className="w-full h-auto rounded-lg"
              />
            </div>

            <div className="sticky bottom-0 bg-background border-t p-4 flex items-center justify-between">
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    const link = document.createElement("a");
                    link.href = viewImageUrl;
                    link.download = `training-poster-${Date.now()}.jpg`;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                  }}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Use arrow keys or swipe to navigate
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponderTasksPage;
