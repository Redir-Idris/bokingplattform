import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  Grid,
  Stack,
} from "@mui/material";
import GroupsIcon from "@mui/icons-material/Groups";
import MeetingRoomIcon from "@mui/icons-material/MeetingRoom";
import api from "../api/api";

function Rooms() {
  const [rooms, setRooms] = useState([]);
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
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
    fetchRooms();
  }, []);

  if (loading) {
    return (
      <Box
        sx={{
          minHeight: "50vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}
      >
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography>Loading rooms...</Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return <Alert severity="error">{error}</Alert>;
  }

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" gutterBottom>Rooms</Typography>
        <Typography variant="body1" color="text.secondary">
          Here you can see all available rooms in the system.
        </Typography>
      </Box>

      {source && (
        <Alert severity={source === "cache" ? "success" : "info"} sx={{ mb: 3 }}>
          Data source: <strong>{source}</strong>
        </Alert>
      )}

      {rooms.length === 0 ? (
        <Card sx={{ borderRadius: 4, boxShadow: 2 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              No rooms found
            </Typography>
            <Typography color="text.secondary">
              There are no rooms in the database yet.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={3}>
          {rooms.map((room) => (
            <Grid item xs={12} md={6} lg={4} key={room._id}>
              <Card
                sx={{
                  height: "100%",
                  borderRadius: 4,
                  boxShadow: 3,
                  transition: "0.2s ease",
                  "&:hover": {
                    transform: "tanslateY(4-px)",
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
                        <Typography variant="h6" gutterBottom>
                          {room.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          ROOM ID: {room._id}
                        </Typography>
                      </Box>

                      <MeetingRoomIcon color="primary" />
                    </Box>

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
                      sx={{ width: "fit-content", textTransform: "capitalize" }}>
                    </Chip>
                  </Stack>
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