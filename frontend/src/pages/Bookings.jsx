// Booking page
import { useEffect, useState } from "react";
import api from "../api/api";
import socket from "../api/socket";
import {
  Box, Card, CardContent,
  Typography, TextField, Button,
  Alert, Stack, CircularProgress,
  MenuItem, Grid, Chip,
  IconButton, Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive"



function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomId: "",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [liveMessage, setLiveMessage] = useState("");

  async function fetchBookings() {
    try {
      const res = await api.get("/bookings");
      setBookings(res.data.bookings || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load bookings");
    }
  }

  async function fetchRooms() {
    try {
      const res = await api.get("/rooms");
      setRooms(res.data.rooms || []);
    } catch (err) {
      setError(err.response?.data?.message || "Could not load rooms");
    }
  }

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError("");
        await Promise.all([fetchBookings(), fetchRooms()]);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  useEffect(() => {
    function handleBookingCreated(payload) {
      setLiveMessage(`New booking created for room ${payload.roomId}`);
      fetchBookings();
    }

    function handleBookingUpdated(payload) {
      setLiveMessage(`Booking updated for room ${payload.roomId}`);
      fetchBookings();
    }

    function handleBookingDeleted(payload) {
      setLiveMessage(`Booking deleted for room ${payload.roomId}`);
      fetchBookings();
    }

    socket.on("booking:created", handleBookingCreated);
    socket.on("booking:updated", handleBookingUpdated);
    socket.on("booking:deleted", handleBookingDeleted);

    return () => {
      socket.off("booking:created", handleBookingCreated);
      socket.off("booking:created", handleBookingCreated);
      socket.off("booking:created", handleBookingCreated);
    };
  }, []);

  async function handleCreateBooking(e) {
    e.preventDefault();

    try {
      setError("");
      setSubmitting(true);

      await api.post("/bookings", {
        roomId: form.roomId,
        startTime: form.startTime,
        endTime: form.endTime,
      });

      setForm({
        roomId: "",
        startTime: "",
        endTime: "",
      });

    } catch (err) {
      setError(err.response?.data?.message || "Could not create booking");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteBooking(id) {
    try {
      setError("");
      await api.delete(`/bookings/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete booking");
    }
  }

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Loading bookings...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Bookings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Create and manage reservations for rooms in the system.
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={5}>
          <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
            <CardContent>
              <Stack spacing={3}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <EventAvailableIcon color="primary" />
                  <Typography variant="h6">Create booking</Typography>
                </Box>

                {error && <Alert severity="error">{error}</Alert>}

                {liveMessage && (
                  <Alert
                    severity="info"
                    icon={<NotificationsActiveIcon fontSize="inherit" />}
                  >
                    {liveMessage}
                  </Alert>
                )}

                <Box
                  component="form"
                  onSubmit={handleCreateBooking}
                  sx={{ display: "flex", flexDirection: "column", gap: 2 }}
                >
                  <TextField
                    select
                    label="Room"
                    value={form.roomId}
                    onChange={(e) =>
                      setForm({ ...form, roomId: e.target.value })
                    }
                    fullWidth
                    required
                  >
                    <MenuItem value="">Select room</MenuItem>
                    {rooms.map((room) => (
                      <MenuItem key={room._id} value={room._id}>
                        {room.name} ({room.type})
                      </MenuItem>
                    ))}
                  </TextField>

                  <TextField
                    label="Start-time"
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) =>
                      setForm({ ...form, startTime: e.target.value })
                    }
                    inputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                  />

                  <TextField
                    label="End-time"
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) =>
                      setForm({ ...form, endTime: e.target.value })
                    }
                    inputLabelProps={{ shrink: true }}
                    fullWidth
                    required
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    size="large"
                    disabled={submitting}
                    startIcon={<EventAvailableIcon />}
                    sx={{ py: 1.3 }}
                  >
                    {submitting ? "Creating..." : "Create booking"}
                  </Button>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} lg={7}>
          <Stack spacing={2}>
            <Typography variant="h6">My bookings</Typography>
            {bookings.length === 0 ? (
              <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
                <CardContent>
                  <Typography variant="subtitle1" gutterBottom>
                    No booking found
                  </Typography>
                  <Typography color="text.secondary">
                    You have no reservations yet.
                  </Typography>
                </CardContent>
              </Card>
            ) : (
              bookings.map((booking) => (
                <Card
                  key={booking._id}
                  sx={{
                    borderRadius: 4,
                    boxShadow: 3,
                    transition: "0.2s ease",
                    "&:hover": {
                      transform: "translateY(-3px)",
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="h6">
                            {booking.roomId?.name || "Unknown room"}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Booking ID: {booking._id}
                          </Typography>
                        </Box>

                        <IconButton
                          color="error"
                          onClick={() => handleDeleteBooking(booking._id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Box>

                      <Divider />

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <MeetingRoomIcon fontSize="small" color="primary" />
                        <Chip
                          label={booking.roomId?.type || "unknown"}
                          variant="outlined"
                          color="primary"
                          sx={{ TextTransform: "capitalize" }}
                        />
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>Start</strong>{" "}
                          {new Date(booking.startTime).toLocaleString()}
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <AccessTimeIcon fontSize="small" color="action" />
                        <Typography variant="body2">
                          <strong>End</strong>{" "}
                          {new Date(booking.endTime).toLocaleString()}
                        </Typography>
                      </Box>
                    </Stack>
                  </CardContent>
                </Card>
              ))
            )}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

export default Bookings;