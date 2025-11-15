import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useStore from "../store/useStore";
import { api } from "../utils/api";
import { timezones } from "../utils/timezone.js";
import EventList from "../components/EventList";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();
  const {
    profiles,
    selectedProfile,
    setProfiles,
    setSelectedProfile,
    updateProfileTimezone,
  } = useStore();
  const [loading, setLoading] = useState(true);
  const [profileSearch, setProfileSearch] = useState("");
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showProfileDropdown && !event.target.closest(".form-group")) {
        setShowProfileDropdown(false);
        setProfileSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showProfileDropdown]);

  const loadProfiles = async () => {
    try {
      const data = await api.getAllProfiles();
      setProfiles(data);
      if (data.length > 0 && !selectedProfile) {
        // Try to restore from localStorage or use first profile
        const savedProfileId = localStorage.getItem("selectedProfileId");
        const profileToSelect = savedProfileId
          ? data.find((p) => p._id === savedProfileId) || data[0]
          : data[0];
        setSelectedProfile(profileToSelect);
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimezoneChange = async (e) => {
    const newTimezone = e.target.value;
    try {
      await api.updateProfileTimezone(selectedProfile._id, newTimezone);
      updateProfileTimezone(selectedProfile._id, newTimezone);
    } catch (error) {
      console.error("Error updating timezone:", error);
    }
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (profiles.length === 0) {
    return (
      <div className="page-container">
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <div className="empty-state-text">No profiles found</div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/create-profile")}
          >
            Create Your First Profile
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">Dashboard</h1>

      <div className="card">
        <div className="profile-selector-container">
          <div className="form-group">
            <label className="form-label">Select Profile</label>
            <div style={{ position: "relative" }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search and select profile..."
                value={
                  showProfileDropdown
                    ? profileSearch
                    : selectedProfile?.name || ""
                }
                onChange={(e) => {
                  setProfileSearch(e.target.value);
                  setShowProfileDropdown(true);
                }}
                onFocus={() => {
                  setProfileSearch("");
                  setShowProfileDropdown(true);
                }}
                style={{ cursor: "pointer" }}
              />
              {showProfileDropdown && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    left: 0,
                    right: 0,
                    backgroundColor: "white",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    maxHeight: "200px",
                    overflowY: "auto",
                    zIndex: 1000,
                    marginTop: "4px",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                  }}
                >
                  {profiles
                    .filter((profile) =>
                      profile.name
                        .toLowerCase()
                        .includes(profileSearch.toLowerCase())
                    )
                    .map((profile) => (
                      <div
                        key={profile._id}
                        onClick={() => {
                          setSelectedProfile(profile);
                          setShowProfileDropdown(false);
                          setProfileSearch("");
                        }}
                        style={{
                          padding: "10px",
                          cursor: "pointer",
                          backgroundColor:
                            selectedProfile?._id === profile._id
                              ? "#f0f0f0"
                              : "white",
                          borderBottom: "1px solid #eee",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.backgroundColor = "#f5f5f5")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.backgroundColor =
                            selectedProfile?._id === profile._id
                              ? "#f0f0f0"
                              : "white")
                        }
                      >
                        {profile.name}
                      </div>
                    ))}
                  {profiles.filter((profile) =>
                    profile.name
                      .toLowerCase()
                      .includes(profileSearch.toLowerCase())
                  ).length === 0 && (
                    <div
                      style={{
                        padding: "10px",
                        color: "#999",
                        textAlign: "center",
                      }}
                    >
                      No profiles found
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {selectedProfile && (
            <div className="form-group">
              <label className="form-label">Your Timezone</label>
              <select
                className="form-select"
                value={selectedProfile.timezone}
                onChange={handleTimezoneChange}
              >
                {timezones.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {selectedProfile && (
        <EventList
          profileId={selectedProfile._id}
          timezone={selectedProfile.timezone}
        />
      )}
    </div>
  );
}

export default Dashboard;
