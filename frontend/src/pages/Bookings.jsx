// Booking page
import { useEffect, useState } from "react";
import api from "../api/api";

function Bookings() {
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({
    roomId: "",
    startTime: "",
    endTime: "",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  async function handleCreateBooking(e) {
    e.preventDefault();

    try {
      setError("");

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

      await fetchBookings(),
        alert("Booking created");
    } catch (err) {
      alert(err.response?.data?.message || "Could not create booking");
    }
  }

  async function handleDeleteBooking(id) {
    try {
      await api.delete(`/bookings/${id}`);
      await fetchBookings();
      alert("Booking deleted");
    } catch (err) {
      alert(err.response?.data?.message || "Could not delete booking");
    }
  }

  if (loading) {
    return <p>Loading bookings...</p>
  }

  if (error) {
    return <p>{error}</p>
  }

  return (
    <div>
      <h2>Bookings</h2>

      <form
        onSubmit={handleCreateBooking}
        style={{
          border: "1px solid #ccc",
          padding: "16px",
          borderRadius: "8px",
          marginBottom: "24px",
        }}
      >
        <h3>Create Booking</h3>

        <select value={form.roomId}
          onChange={(e) => setForm({ ...form, roomId: e.target.value })}
        >
          <option value="">Select room</option>
          {rooms.map((room) => (
            <option key={room._id} value={room._id}>
              {room.name} ({room.type})
            </option>
          ))}
        </select>

        <br />
        <br />

        <input
          type="datetime-local"
          value={form.startTime}
          onChange={(e) => setForm({ ...form, startTime: e.target.value })}
        />

        <br />
        <br />

        <input
          type="datetime-local"
          value={form.endTime}
          onChange={(e) => setForm({ ...form, endTime: e.target.value })}
        />

        <br />
        <br />

        <button type="submit">Create booking</button>
      </form>

      <h3>My bookings</h3>

      {bookings.length === 0 ? (
        <p>No bookings found.</p>
      ) : (
        bookings.map((booking) => (
          <div
            key={booking._id}
            style={{
              border: "1px solid #ccc",
              padding: "12px",
              borderRadius: "8px",
              marginBottom: "12px",
            }}
          >
            <p>
              <strong>Room:</strong> {booking.roomId?.name || "Unknown room"}
            </p>
            <p>
              <strong>Start:</strong> {" "}
              {new Date(booking.startTime).toLocaleString()}
            </p>
            <p>
              <strong>End:</strong> {" "}
              {new Date(booking.endTime).toLocaleString()}
            </p>

            <button onClick={() => handleDeleteBooking(booking._id)}>
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default Bookings;