const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

export const api = {
    createProfile: async (data) => {
        // console.log("initizlizing profile creation", data)
        const response = await fetch(`${API_BASE_URL}/profiles`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        // console.log("checking response", response)

        if (!response.ok) throw new Error('Failed to create profile');
        return response.json();
    },

    getAllProfiles: async () => {
        const response = await fetch(`${API_BASE_URL}/profiles`)
        if (!response.ok) throw new Error('Failed to Load profiles');
        return response.json();
    },

    getProfileById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/profile/${id}`)
        if (!response.ok) throw new Error('Failed to fetch profile');
        return response.json()
    },

    updateProfileTimezone: async (id, timezone) => {
        const response = await fetch(`${API_BASE_URL}/profiles/${id}/timezone`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ timezone })
        });
        if (!response.ok) throw new Error('Failed to update timezone');
        return response.json();
    },

    createEvent: async (data) => {
        const response = await fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to create event');
        return response.json();
    },

    getEventsByProfile: async (profileId) => {
        const response = await fetch(`${API_BASE_URL}/events/profile/${profileId}`);
        if (!response.ok) throw new Error('Failed to fetch events');
        return response.json();
    },

    getEventById: async (id) => {
        const response = await fetch(`${API_BASE_URL}/events/${id}`);
        if (!response.ok) throw new Error('Failed to fetch event');
        return response.json();
    },
    updateEvent: async (id, data) => {
        const response = await fetch(`${API_BASE_URL}/events/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        if (!response.ok) throw new Error('Failed to update event');
        return response.json();
    }




}