import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import useStore from "../store/useStore.js";
import { api } from "../utils/api.js";
import { timezones } from "../utils/timezone.js";
import "./CreateEvent.css";

dayjs.extend(utc);
dayjs.extend(timezone);

function CreateEvent() {
  const navigate = useNavigate();
  const { profiles, setProfiles, addEvent } = useStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    selectedProfiles: [],
    timezone: "UTC",
    startDate: "",
    startTime: "",
    endDate: "",
    endTime: "",
  });
  const [profileSearch, setProfileSearch] = useState("");

  useEffect(() => {
    loadProfiles();
  }, []);

  const loadProfiles = async () => {
    try {
      const data = await api.getAllProfiles();
      setProfiles(data);
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
  };

  const handleProfileToggle = (profileId) => {
    setFormData((prev) => ({
      ...prev,
      selectedProfiles: prev.selectedProfiles.includes(profileId)
        ? prev.selectedProfiles.filter((id) => id !== profileId)
        : [...prev.selectedProfiles, profileId],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (formData.selectedProfiles.length === 0) {
      setError("Select at least one profile");
      return;
    }

    if (
      !formData.startDate ||
      !formData.startTime ||
      !formData.endDate ||
      !formData.endTime
    ) {
      setError("All date and time fields are required");
      return;
    }

    const startDateTime = dayjs.tz(
      `${formData.startDate} ${formData.startTime}`,
      formData.timezone
    );
    const endDateTime = dayjs.tz(
      `${formData.endDate} ${formData.endTime}`,
      formData.timezone
    );

    if (endDateTime.isBefore(startDateTime)) {
      setError("End date/time cannot be before start date/time");
      return;
    }

    setLoading(true);

    try {
      const event = await api.createEvent({
        title: formData.title.trim(),
        description: formData.description.trim(),
        profiles: formData.selectedProfiles,
        timezone: formData.timezone,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
      });

      addEvent(event);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Create Event</h1>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Title *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              placeholder="Enter event title"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-textarea"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Enter event description"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Select Profiles *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Search profiles..."
              value={profileSearch}
              onChange={(e) => setProfileSearch(e.target.value)}
              style={{ marginBottom: "10px" }}
            />
            <div className="profile-checkboxes">
              {profiles
                .filter((profile) =>
                  profile.name
                    .toLowerCase()
                    .includes(profileSearch.toLowerCase())
                )
                .map((profile) => (
                  <label key={profile._id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.selectedProfiles.includes(profile._id)}
                      onChange={() => handleProfileToggle(profile._id)}
                    />
                    <span>{profile.name}</span>
                  </label>
                ))}
              {profiles.filter((profile) =>
                profile.name.toLowerCase().includes(profileSearch.toLowerCase())
              ).length === 0 && (
                <div style={{ color: "#999", padding: "10px" }}>
                  No profiles found
                </div>
              )}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Timezone *</label>
            <select
              className="form-select"
              value={formData.timezone}
              onChange={(e) =>
                setFormData({ ...formData, timezone: e.target.value })
              }
            >
              {timezones.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          <div className="datetime-row">
            <div className="form-group">
              <label className="form-label">Start Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.startDate}
                onChange={(e) =>
                  setFormData({ ...formData, startDate: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                className="form-input"
                value={formData.startTime}
                onChange={(e) =>
                  setFormData({ ...formData, startTime: e.target.value })
                }
              />
            </div>
          </div>

          <div className="datetime-row">
            <div className="form-group">
              <label className="form-label">End Date *</label>
              <input
                type="date"
                className="form-input"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData({ ...formData, endDate: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">End Time *</label>
              <input
                type="time"
                className="form-input"
                value={formData.endTime}
                onChange={(e) =>
                  setFormData({ ...formData, endTime: e.target.value })
                }
              />
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Event"}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateEvent;
