import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Rooms from "./pages/Rooms";
import Bookings from "./pages/Bookings";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

function AppLayout() {
  const location = useLocation();
  const showNavbar = location.pathname !== "/";

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/rooms" element={
          <ProtectedRoute>
            <Rooms />
          </ProtectedRoute>
        }
        />
        <Route path="/bookings" element={
          <ProtectedRoute>
            <Bookings />
          </ProtectedRoute>
        }
        />
      </Routes>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}

export default App;
