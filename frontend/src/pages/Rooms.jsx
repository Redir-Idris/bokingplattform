import { useEffect, useState } from "react";
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
    return <p>Loading rooms...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Rooms</h2>
      {source && <p>Data source: {source}</p>}
      {rooms.length === 0 ? (
        <p>no rooms found.</p>
      ) : (
        rooms.map((room) => (
          <div
            key={room._id}
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              marginBottom: "12px",
              borderRadius: "8px",
            }}
          >
            <h3>{room.name}</h3>
            <p>Capacity: {room.capacity}</p>
            <p>Type: {room.type}</p>
          </div>
        ))
      )}
    </div>
  );
}

export default Rooms;