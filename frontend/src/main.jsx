import React from 'react';
import ReactDOM from "react-dom/client";
import { CssBaseline, ThemeProvider, createTheme } from "@mui/material";
import App from './App.jsx';

const theme = createTheme({
  palette: {
    mode: "light",
    primary: {
      main: "#1976d2",
    },
    secondary: {
      main: "#7b1fa2",
    },
    background: {
      default: "#f5f7fb",
    },
  },
  shape: {
    borderRadius: 12,
  },
  typography: {
    fontFamily: "Arial, sans-serif",
    h2: {
      fontWeight: 700,
    },
    h5: {
      fontWeight: 600,
    },
  },
});

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <App />
    </ThemeProvider>
  </React.StrictMode>
);
