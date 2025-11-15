import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { api } from "../utils/api.js";
// import { timezones } from "../utils/timezone.js";
import './EventList.css';

dayjs.extend(utc);
dayjs.extend(timezone);

function EventList({ profileId, timezone }) {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profileId) {
      loadEvents();
    }
  }, [profileId, timezone]);

  const loadEvents = async () => {
    try {
      const data = await api.getEventsByProfile(profileId);
      setEvents(data);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return <div className="loading">Loading events...</div>;
  }

  if (events.length == 0) {
    return (
      <div className="card">
        <div className="empty-state">
          <div className="empty-state-icon">📅</div>
          <div className="empty-state-text">No events found</div>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/create-event")}
          >
            Create Your First Event
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="events-container">
      <h2 className="section-title">Your Events</h2>
      <div className="events-grid">
        {events.map((event) => {
          const start = dayjs(event.startDateTime).tz(timezone);
          const end = dayjs(event.endDateTime).tz(timezone);

          return (
            <div
              key={event._id}
              className="event-card"
              onClick={() => navigate(`/event/${event._id}`)}
            >
              <h3 className="event-title">{event.title}</h3>
              {event.description && (
                <p className="event-description">{event.description}</p>
              )}
              <div className="event-time">
                <div>🕐 {start.format("MMM D, YYYY [at] h:mm A")}</div>
                <div>🕐 {end.format("MMM D, YYYY [at] h:mm A")}</div>
              </div>
              <div className="event-profiles">
                {event.profiles.map((profile) => (
                  <span key={profile._id} className="profile-tag">
                    {profile.name}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}


export default EventList;