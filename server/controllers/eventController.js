import Event from "../models/Event.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc)
dayjs.extend(timezone)

export const createEvent = async (req, res) => {
    try {
        const {
            profiles,
            timezone,
            startDateTime,
            endDateTime,
            title,
            description
        } = req.body;

        if (!profiles || profiles?.length === 0) {
            return res.status(400).json({ erorr: "Atleast one profile is required" })
        }

        if (!timezone || !startDateTime || !endDateTime || !title) {
            return res
                .status(400)
                .json({ error: "All required fields must be provided" });
        }

        const start = dayjs(startDateTime).tz(timezone)
        const end = dayjs(endDateTime).tz(timezone)

        if (end.isBefore(start)) {
            return res
                .status(400)
                .json({ error: "End date/time cannot be before start date/time" });

        }

        const event = new Event({
            profiles,
            timezone,
            startDateTime: start.toDate(),
            endDateTime: end.toDate(),
            title,
            description

        })

        await event.save();
        await event.populate("profiles");
        res.status(201).json(event);


    } catch (error) {
        res.status(500).json({ error: error.message })
    }

}

export const getEventsByProfile = async (req, res) => {
    try {
        const { profileId } = req.params;

        const events = await Event.find(
            { profiles: profileId })
            .populate("profiles")
            .populate("updateLogs.updatedBy")
            .sort({ startDateTime: 1 });

        res.json(events);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }

}

export const getEventById = async (req, res) => {
    try {
        const event = await Event.findById(req.params.id)
            .populate("profiles")
            .populate("updateLogs.updatedBy")

        if (!event) {
            return res.status(404).json({ error: "Event not found" })
        }
        
        res.json(event);
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const updateEvent = async (req, res) => {
    try {

        const {
            profiles,
            timezone,
            startDateTime,
            endDateTime,
            title,
            description,
            updatedBy,
        } = req.body;

        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({ error: "event not found" })
        }

        const currentlyAssisgned = event.profiles.some((p) => p.toString() === updatedBy)
        const willBeAssigned = profiles && profiles.includes(currentlyAssisgned);

        if (!currentlyAssisgned && !willBeAssigned) {
            return res.status(403).json({ error: "you cannot update the event" })
        }
        const changes = new Map();
        let profilesChanged = false;
        let oldProfileNames = [];

        if (profiles && JSON.stringify(profiles) !== JSON.stringify(event.profiles.map((p) => p.toString()))) {

            //populate old profiles to get names before changing

            await event.populate("profiles")
            oldProfileNames = event.profiles.map((p) => p.name)

            profilesChanged = true;

            event.profiles = profiles;


        }

        if (timezone && timezone !== event.timezone) {
            changes.set("timezone", { old: event.timezone, new: timezone })
            event.timezone = timezone
        }

        if (startDateTime) {
            const newStart = dayjs(startDateTime)
                .tz(timezone || event.timezone)
                .toDate();
            if (newStart.getTime() !== event.startDateTime.getTime()) {
                changes.set("startDateTime", {
                    old: event.startDateTime,
                    new: newStart,
                });
                event.startDateTime = newStart;
            }
        }

        if (endDateTime) {
            const newEnd = dayjs(endDateTime)
                .tz(timezone || event.timezone)
                .toDate();
            if (newEnd.getTime() !== event.endDateTime.getTime()) {
                changes.set("endDateTime", { old: event.endDateTime, new: newEnd });
                event.endDateTime = newEnd;
            }
        }

        if (title && title !== event.title) {
            changes.set("title", { old: event.title, new: title });
            event.title = title;
        }

        if (description !== undefined && description !== event.description) {
            changes.set("description", { old: event.description, new: description });
            event.description = description;
        }

        if (dayjs(event.endDateTime).isBefore(dayjs(event.startDateTime))) {
            return res
                .status(400)
                .json({ error: "End date/time cannot be before start date/time" });
        }

        await event.save();
        await event.populate("profiles");

        if (profilesChanged) {
            const newProfileNames = event.profiles.map((p) => p.name);
            changes.set("profiles", {
                old: oldProfileNames,
                new: newProfileNames
            })
        }

        if (changes.size > 0) {
            event.updateLogs.push({
                updatedBy,
                updatedAt: new Date(),
                changes,
            });
            event.updatedAt = new Date();
            await event.save();
        }

        await event.populate("updateLogs.updatedBy");

        res.json(event);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

