// Navbar 
import { Link, useNavigate } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav
      style={{
        display: "flex",
        gap: "16px",
        padding: "16px",
        borderBottom: "1px solid #ccc",
        marginBottom: "24px",
      }}
    >
      <Link to="/rooms">Romms</Link>
      <Link to="/bookings">Bookings</Link>

      <button onClick={handleLogout}>Logout</button>
    </nav>
  );
}

export default Navbar;