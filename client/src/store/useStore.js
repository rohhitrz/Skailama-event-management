import { create } from "zustand";

const useStore = create((set) => ({
  profiles: [],
  events: [],
  selectedProfile: null,

  setProfiles: (profiles) => set({ profiles }),

  addProfile: (profile) =>
    set((state) => ({
      profiles: [...state.profiles, profile],
    })),

  setSelectedProfile: (profile) => {
    // Save to localStorage for persistence
    if (profile) {
      localStorage.setItem("selectedProfileId", profile._id);
    } else {
      localStorage.removeItem("selectedProfileId");
    }
    set({ selectedProfile: profile });
  },

  updateProfileTimezone: (profileId, timezone) =>
    set((state) => ({
      profiles: state.profiles.map((p) =>
        p._id === profileId ? { ...p, timezone } : p
      ),
      selectedProfile:
        state.selectedProfile?._id === profileId
          ? { ...state.selectedProfile, timezone }
          : state.selectedProfile,
    })),

  setEvents: (events) => set({ events }),

  addEvent: (event) =>
    set((state) => ({
      events: [...state.events, event],
    })),

  updateEvent: (eventId, updatedEvent) =>
    set((state) => ({
      events: state.events.map((e) => (e._id === eventId ? updatedEvent : e)),
    })),
}));

export default useStore;
