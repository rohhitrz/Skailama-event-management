import Event from "../models/Event.js";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from dayjs / plugin / timezone

dayjs.extend(utc)
dayjs.extend(timezonePlugin)

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
