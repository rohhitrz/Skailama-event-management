import Profile from "../models/Profile.js";

export const createProfile = async (req, res) => {
    try {
        const { name, timezone } = req.body;

        if (!name) {
            return res.status(400).json({ error: "name is required" })
        }

        const profile = new Profile({ name, timezone: timezone || 'UTC' })
        await profile.save();
        res.status(201).json(profile);
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const getAllProfiles = async (req, res) => {
    try {
       const profiles=await Profile.find().sort({createdAt:-1})
       res.json(profiles)

    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

export const getProfileById=async(req,res)=>{
    try{
        const profile= await Profile.findById(req.params.id);
        if(!profile){
            res.status(404).json({ error: "Profile not found"});
        }
        res.json(profile);

    }catch(error){
        res.status(500).json({ error: error.message });
    }
}

export const updateTimezone = async (req, res) => {
    try {
        const { timezone } = req.body

        if (!timezone) {
            return res.status(400).json({ error: 'Timezone is required' });
        }

        const profile = await Profile.findByIdAndUpdate(
            req.params.id, { timeZone }, { new: true })

        if (!profile) {
            return res.status(404).json({ error: 'Profile not found' });
        }
        res.json(profile);


    } catch (error) {
        res.status(500).json({ error: error.message });
    }


}
