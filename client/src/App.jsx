import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import CreateProfile from "./pages/CreateProfile";
import CreateEvent from "./pages/CreateEvent";
import EventDetails from "./pages/EventDetails";
import "./App.css";

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-profile" element={<CreateProfile />} />
          <Route path="/create-event" element={<CreateEvent />} />
          <Route path="/event/:id" element={<EventDetails />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
