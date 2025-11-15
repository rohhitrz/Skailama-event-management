import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';
import { api } from '../utils/api';
import { timezones } from '../utils/timezone.js';
import './CreateProfile.css';

function CreateProfile() {
  const navigate = useNavigate();
  const { addProfile } = useStore();
  const [name, setName] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Name is required');
      return;
    }

    setLoading(true);

    try {
      const profile = await api.createProfile({ name: name.trim(), timezone });
      addProfile(profile);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <h1 className="page-title">Create Profile</h1>
      
      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Name *</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter profile name"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Timezone</label>
            <select
              className="form-select"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
            >
              {timezones.map(tz => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Creating...' : 'Create Profile'}
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={() => navigate('/dashboard')}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateProfile;
