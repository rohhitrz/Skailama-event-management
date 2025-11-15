import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import useStore from "../store/useStore";
import { api } from "../utils/api";
import { timezones } from "../utils/timezone.js";
import "./EventDetails.css";

dayjs.extend(utc);
dayjs.extend(timezone);

function UpdateLogItem({ log, userTz, isExpanded, onToggle }) {
  const changes = log.changes
    ? Object.entries(log.changes).filter(
        ([_, value]) =>
          value &&
          typeof value === "object" &&
          ("old" in value || "new" in value)
      )
    : [];

  return (
    <div className="update-log">
      <div
        className="log-header"
        onClick={onToggle}
        style={{ cursor: "pointer" }}
      >
        <div className="log-info">
          <div>
            <strong>Updated by:</strong>{" "}
            {log.updatedBy?.name || (
              <span style={{ color: "#999", fontStyle: "italic" }}>
                Profile Removed
              </span>
            )}
          </div>
          <span className="log-time">
            {dayjs(log.updatedAt).tz(userTz).format("MMMM D, YYYY [at] h:mm A")}
          </span>
        </div>
        <button className="expand-btn" type="button">
          {isExpanded ? "▼ Hide Changes" : "▶ Show Changes"}
        </button>
      </div>

      {isExpanded && (
        <div className="log-changes">
          {changes.length > 0 ? (
            changes.map(([field, change]) => (
              <div key={field} className="change-item">
                <strong className="change-field">
                  {formatFieldName(field)}:
                </strong>
                <div className="change-values">
                  <div className="change-value-row">
                    <span className="change-label">From:</span>
                    <span className="old-value">
                      {formatChangeValue(field, change.old, userTz)}
                    </span>
                  </div>
                  <div className="change-arrow">↓</div>
                  <div className="change-value-row">
                    <span className="change-label">To:</span>
                    <span className="new-value">
                      {formatChangeValue(field, change.new, userTz)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-changes">No changes recorded</div>
          )}
        </div>
      )}
    </div>
  );
}

function formatFieldName(field) {
  const fieldNames = {
    title: "Title",
    description: "Description",
    profiles: "Assigned Profiles",
    timezone: "Timezone",
    startDateTime: "Start Date & Time",
    endDateTime: "End Date & Time",
  };
  return fieldNames[field] || field;
}

function EventDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    selectedProfile,
    profiles,
    setProfiles,
    setSelectedProfile,
    updateEvent,
  } = useStore();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [expandedLogs, setExpandedLogs] = useState({});
  const [profileSearch, setProfileSearch] = useState("");
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

  const toggleLog = (index) => {
    setExpandedLogs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  useEffect(() => {
    loadEvent();
    loadProfiles();
  }, [id]);

  const loadProfiles = async () => {
    try {
      const data = await api.getAllProfiles();
      setProfiles(data);

      if (!selectedProfile && data.length > 0) {
        const savedProfileId = localStorage.getItem("selectedProfileId");
        const profileToSelect = savedProfileId
          ? data.find((p) => p._id === savedProfileId) || data[0]
          : data[0];
        setSelectedProfile(profileToSelect);
      }
    } catch (error) {
      console.error("Error loading profiles:", error);
    }
  };

  const loadEvent = async () => {
    try {
      const data = await api.getEventById(id);
      setEvent(data);

      const userTz = selectedProfile?.timezone || "UTC";
      const start = dayjs(data.startDateTime).tz(userTz);
      const end = dayjs(data.endDateTime).tz(userTz);

      setFormData({
        title: data.title,
        description: data.description || "",
        selectedProfiles: data.profiles.map((p) => p._id),
        timezone: data.timezone,
        startDate: start.format("YYYY-MM-DD"),
        startTime: start.format("HH:mm"),
        endDate: end.format("YYYY-MM-DD"),
        endTime: end.format("HH:mm"),
      });
    } catch (error) {
      console.error("Error loading event:", error);
      setError("Failed to load event");
    } finally {
      setLoading(false);
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    setError("");

   
    if (
      !selectedProfile ||
      !formData.selectedProfiles.includes(selectedProfile._id)
    ) {
      setError(
        "You cannot update this event as you are no longer assigned to it"
      );
      setEditing(false);
      await loadEvent(); 
      return;
    }

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (formData.selectedProfiles.length === 0) {
      setError("Select at least one profile");
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
      const updatedEvent = await api.updateEvent(id, {
        title: formData.title.trim(),
        description: formData.description.trim(),
        profiles: formData.selectedProfiles,
        timezone: formData.timezone,
        startDateTime: startDateTime.toISOString(),
        endDateTime: endDateTime.toISOString(),
        updatedBy: selectedProfile?._id,
      });

      setEvent(updatedEvent);
      updateEvent(id, updatedEvent);
      setEditing(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !event) {
    return <div className="loading">Loading...</div>;
  }

  if (!event) {
    return <div className="error-message">Event not found</div>;
  }

  const userTz = selectedProfile?.timezone || "UTC";
  const startDisplay = dayjs(event.startDateTime).tz(userTz);
  const endDisplay = dayjs(event.endDateTime).tz(userTz);

  
  const isAssigned =
    selectedProfile &&
    event.profiles.some((p) => p._id === selectedProfile._id);

  return (
    <div className="page-container">
      <h1 className="page-title">Event Details</h1>

      <div className="card">
        {!editing ? (
          <div className="event-view">
            <div className="event-header">
              <h2>{event.title}</h2>
              {isAssigned ? (
                <button
                  className="btn btn-primary"
                  onClick={() => setEditing(true)}
                >
                  Edit Event
                </button>
              ) : (
                <div className="access-denied-badge">View Only</div>
              )}
            </div>

            {!isAssigned && (
              <div className="warning-message">
                You are not assigned to this event. You can view details but
                cannot make changes.
              </div>
            )}

            {event.description && (
              <div className="event-section">
                <h3>Description</h3>
                <p>{event.description}</p>
              </div>
            )}

            <div className="event-section">
              <h3>Assigned Profiles</h3>
              <div className="profile-list">
                {event.profiles.map((profile) => (
                  <span key={profile._id} className="profile-badge">
                    {profile.name}
                  </span>
                ))}
              </div>
            </div>

            <div className="event-section">
              <h3>Date & Time (in your timezone: {userTz})</h3>
              <div className="datetime-display">
                <div>
                  <strong>Start:</strong>{" "}
                  {startDisplay.format("MMMM D, YYYY [at] h:mm A")}
                </div>
                <div>
                  <strong>End:</strong>{" "}
                  {endDisplay.format("MMMM D, YYYY [at] h:mm A")}
                </div>
              </div>
            </div>

            <div className="event-section">
              <h3>Event Timezone</h3>
              <p>{event.timezone}</p>
            </div>

            <div className="event-section">
              <h3>Metadata</h3>
              <div className="metadata">
                <div>
                  <strong>Created:</strong>{" "}
                  {dayjs(event.createdAt)
                    .tz(userTz)
                    .format("MMMM D, YYYY [at] h:mm A")}
                </div>
                <div>
                  <strong>Last Updated:</strong>{" "}
                  {dayjs(event.updatedAt)
                    .tz(userTz)
                    .format("MMMM D, YYYY [at] h:mm A")}
                </div>
              </div>
            </div>

            {event.updateLogs && event.updateLogs.length > 0 && (
              <div className="event-section">
                <h3>
                  Update History ({event.updateLogs.length}{" "}
                  {event.updateLogs.length === 1 ? "update" : "updates"})
                </h3>
                <div className="update-logs">
                  {event.updateLogs
                    .slice()
                    .reverse()
                    .map((log, index) => (
                      <UpdateLogItem
                        key={index}
                        log={log}
                        userTz={userTz}
                        isExpanded={expandedLogs[index] || false}
                        onToggle={() => toggleLog(index)}
                      />
                    ))}
                </div>
              </div>
            )}

            <button
              className="btn btn-secondary"
              onClick={() => navigate("/dashboard")}
            >
              Back to Dashboard
            </button>
          </div>
        ) : (
          <form onSubmit={handleUpdate}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input
                type="text"
                className="form-input"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
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
                        checked={formData.selectedProfiles.includes(
                          profile._id
                        )}
                        onChange={() => handleProfileToggle(profile._id)}
                      />
                      <span>{profile.name}</span>
                    </label>
                  ))}
                {profiles.filter((profile) =>
                  profile.name
                    .toLowerCase()
                    .includes(profileSearch.toLowerCase())
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
                {loading ? "Updating..." : "Update Event"}
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setEditing(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function formatChangeValue(field, value, timezone) {
  if (field === "startDateTime" || field === "endDateTime") {
    return dayjs(value).tz(timezone).format("MMMM D, YYYY [at] h:mm A");
  }
  if (field === "profiles") {
    if (Array.isArray(value)) {
      
      return value.length > 0 ? value.join(", ") : "None";
    }
    return value || "N/A";
  }
  return value || "N/A";
}

export default EventDetails;
