import express from 'express';
import verify from '../middleware/verify.middleware';


const router = express.Router();

router.get("/profile", verify, getProfile);

router.put("/profile", verify, updateProfile);

router.delete("/profile", verify, deleteProfile);



export default router;