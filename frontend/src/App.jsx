import { BrowserRouter, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Rooms from "./pages/Rooms";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />}></Route>
        <Route path="/rooms" element={<Rooms />}></Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
