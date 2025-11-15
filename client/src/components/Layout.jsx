import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./Layout.css";

function Layout({ children }) {
  const location = useLocation();

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="navbar-container">
          <Link to="/dashboard" className="navbar-brand">
            Event Management System
          </Link>
          <div className="navbar-links">
            <Link
              to="/dashboard"
              className={
                location.pathname === "/dashboard"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Dashboard
            </Link>
            <Link
              to="/create-profile"
              className={
                location.pathname === "/create-profile"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Create Profile
            </Link>
            <Link
              to="/create-event"
              className={
                location.pathname === "/create-event"
                  ? "nav-link active"
                  : "nav-link"
              }
            >
              Create Event
            </Link>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}

export default Layout;
