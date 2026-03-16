import { Router } from "express";
import { getUser, updateProfile } from "../controllers/userControllers";
import { loginGoogle, logoutGoogle } from "../controllers/authControllers";
import { verifyToken } from "../middlewares/authMiddleware";

const router = Router();

router.post("/signin", loginGoogle);
router.post("/logout", logoutGoogle);
router.get('/me',verifyToken,getUser);
router.patch('/me',verifyToken,updateProfile);


export default router;