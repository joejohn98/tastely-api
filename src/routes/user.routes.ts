import express from 'express';
import verify from '../middleware/verify.middleware';
import { deleteProfile, getProfile, updateProfile } from '../controllers/user.controller';


const router = express.Router();

router.get("/profile", verify, getProfile);

router.put("/profile", verify, updateProfile);

router.delete("/profile", verify, deleteProfile);



export default router;