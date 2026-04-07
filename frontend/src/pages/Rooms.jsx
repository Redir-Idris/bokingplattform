import { useEffect, useMemo, useState } from "react";
import {
  Box, Typography, Card,
  CardContent, Chip, Alert,
  CircularProgress, Grid,
  Stack, TextField, Button,
  MenuItem, Divider,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import SaveIcon from "@mui/icons-material/Save";
import AddBusinessIcon from "@mui/icons-material/AddBusiness";
import api from "../api/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    capacity: "",
    type: "conference",
  });

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    capacity: "",
    type: "",
  });

  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  const isAdmin = useMemo(() => user?.role === "Admin", [user]);

  async function fetchRooms() {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/rooms");
      setRooms(res.data.rooms || []);
      setSource(res.data.source || "");
    } catch (err) {
      setError(err.response?.data?.message || "Could not load rooms");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchRooms();
  }, []);

  async function handleCreateRoom(e) {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      await api.post("/rooms", {
        name: form.name,
        capacity: Number(form.capacity),
        type: form.type,
      });

      setForm({
        name: "",
        capacity: "",
        type: "conference",
      });

      await fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Could not create room");
    } finally {
      setSubmitting(false);
    }
  }

  function startEdit(room) {
    setEditingId(room._id);
    setEditForm({
      name: room.name,
      capacity: room.capacity,
      type: room.type,
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setEditForm({
      name: "",
      capacity: "",
      type: "",
    });
  }

  async function handleUpdateRoom(id) {
    try {
      setError("");

      await api.put(`/rooms/${id}`, {
        name: editForm.name,
        capacity: Number(editForm.capacity),
        type: editForm.type,
      });

      setEditingId(null);
      await fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Could not update room");
    }
  }

  async function handleDeleteRoom(id) {
    try {
      setError("");
      await api.delete(`/rooms/${id}`);
      await fetchRooms();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete room");
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
          <Typography>Loading rooms...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Rooms
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Here you can see all available rooms in the system.
        </Typography>
      </Box>

      {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}

      {source && (
        <Alert severity={source === "cache" ? "success" : "info"} sx={{ mb: 3 }}>
          Data source: <strong>{source}</strong>
        </Alert>
      )}

      {isAdmin && (
        <Card sx={{ borderRadius: 4, boxShadow: 3, mb: 4 }}>
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <AddBusinessIcon color="primary" />
                <Typography variant="h6">Admin: Create room</Typography>
              </Box>

              <Box
                component="form"
                onSubmit={handleCreateRoom}
                sx={{
                  display: "grid",
                  gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr auto" },
                  gap: 2,
                  alignItems: "center",
                }}
              >
                <TextField
                  label="Room name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  fullWidth
                  required
                />

                <TextField
                  label="Capacity"
                  type="number"
                  value={form.capacity}
                  onChange={(e) =>
                    setForm({ ...form, capacity: e.target.value })
                  }
                  fullWidth
                  required
                />

                <TextField
                  select
                  label="Type"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                  fullWidth
                  required
                >
                  <MenuItem value="conference">conference</MenuItem>
                  <MenuItem value="workspace">workspace</MenuItem>
                </TextField>

                <Button
                  type="submit"
                  variant="contained"
                  disabled={submitting}
                  sx={{ height: 56 }}
                >
                  {submitting ? "Creating..." : "Create"}
                </Button>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      )}

      {rooms.length === 0 ? (
        <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No rooms found
            </Typography>
            <Typography color="text.secondary">
              Det finns inga rum i databasen ännu.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid size={{ xs: 12, md: 6, lg: 4 }} key={room._id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  boxShadow: 3,
                  transition: "0.2s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  {editingId === room._id ? (
                    <Stack spacing={2}>
                      <Typography variant="h6">Edit room</Typography>

                      <TextField
                        label="Name"
                        value={editForm.name}
                        onChange={(e) =>
                          setEditForm({ ...editForm, name: e.target.value })
                        }
                        fullWidth
                      />

                      <TextField
                        label="Capacity"
                        type="number"
                        value={editForm.capacity}
                        onChange={(e) =>
                          setEditForm({ ...editForm, capacity: e.target.value })
                        }
                        fullWidth
                      />

                      <TextField
                        select
                        label="Type"
                        value={editForm.type}
                        onChange={(e) =>
                          setEditForm({ ...editForm, type: e.target.value })
                        }
                        fullWidth
                      >
                        <MenuItem value="conference">conference</MenuItem>
                        <MenuItem value="workspace">workspace</MenuItem>
                      </TextField>

                      <Stack direction="row" spacing={1}>
                        <Button
                          variant="contained"
                          startIcon={<SaveIcon />}
                          onClick={() => handleUpdateRoom(room._id)}
                        >
                          Save
                        </Button>

                        <Button variant="outlined" onClick={cancelEdit}>
                          Cancel
                        </Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Box
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                        }}
                      >
                        <Box>
                          <Typography variant="h6" gutterBottom>
                            {room.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Room ID: {room._id}
                          </Typography>
                        </Box>

                        <MeetingRoomIcon color="primary" />
                      </Box>

                      <Divider />

                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <GroupsIcon fontSize="small" color="action" />
                        <Typography>
                          Capacity: <strong>{room.capacity}</strong>
                        </Typography>
                      </Box>

                      <Chip
                        label={room.type}
                        color={room.type === "conference" ? "secondary" : "primary"}
                        variant="outlined"
                        sx={{ width: "fit-content", textTransform: "capitalize" }}
                      />

                      {isAdmin && (
                        <Stack direction="row" spacing={1}>
                          <Button
                            variant="outlined"
                            startIcon={<EditIcon />}
                            onClick={() => startEdit(room)}
                          >
                            Edit
                          </Button>

                          <Button
                            variant="outlined"
                            color="error"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleDeleteRoom(room._id)}
                          >
                            Delete
                          </Button>
                        </Stack>
                      )}
                    </Stack>
                  )}
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

export default Rooms;