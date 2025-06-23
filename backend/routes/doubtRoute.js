import express from 'express'

import {
    createDoubt,
  getDoubtsForEducator,
  getDoubtsForStudent,
  scheduleDoubtSession,
  markDoubtResolved

} from '../controllers/doubtController.js'
import { requireAuth } from "@clerk/express";

import { protectEducator } from "../middlewares/authMiddleware.js";

const doubtRouter = express.Router();

doubtRouter.post('/create-doubt', requireAuth,createDoubt);

doubtRouter.get('/get-my-doubts',getDoubtsForStudent)

doubtRouter.get('/get-doubts-educator',protectEducator,getDoubtsForEducator)

doubtRouter.post('/schedule-doubt/:doubtId', protectEducator, scheduleDoubtSession)

doubtRouter.post('/resolve-doubt/:doubtId',protectEducator,markDoubtResolved);

export default doubtRouter;