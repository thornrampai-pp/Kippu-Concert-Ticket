import { Router } from "express";
import { getUser, updateProfile } from "../controllers/userControllers";
import { loginGoogle, logoutGoogle } from "../controllers/authControllers";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/sigin", loginGoogle);
router.post("/logout", logoutGoogle);
router.get('/profile',verifyToken,getUser);
router.patch('/update',verifyToken,updateProfile);


export default router;