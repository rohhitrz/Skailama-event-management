import express from 'express';
import { createEvent,getEventsByProfile,getEventById,updateEvent } from '../controllers/eventController.js';

const router=express.Router();
router.post('/',createEvent);
router.get('/profile/:profileId',getEventsByProfile);
router.get('/:id',getEventById);
router.put("/:id", updateEvent);

export default router;



