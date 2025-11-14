import mongoose from "mongoose";
import Profile from "./Profile";

const updateLogSchema = new mongoose.Schema({
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Profile",
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  changes: {
    type: Map,
    of: mongoose.Schema.Types.Mixed,
  },
});

const eventSchema=new mongoose.Schema({
    profiles:[
        {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Profile",
      required: true,
    },
    ],
    timezone: {
    type: String,
    required: true,
  },
  startDateTime: {
    type: Date,
    required: true,
  },
  endDateTime: {
    type: Date,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  updateLogs: [updateLogSchema],
});

const Event = mongoose.model("Event", eventSchema);

export default Event;



