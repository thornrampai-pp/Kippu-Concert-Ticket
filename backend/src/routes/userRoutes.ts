import { Router } from "express";
import { loginGoogle, logoutGoogle, refreshToken } from "../controllers/authControllers.js";
import { getUser, updateProfile } from "../controllers/userControllers.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/refresh-token", refreshToken);
router.post("/signin", loginGoogle);
router.post("/logout", logoutGoogle);
router.get('/me',verifyToken,getUser);
router.patch('/me',verifyToken,updateProfile);


export default router;