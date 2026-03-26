import { Router } from "express";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { addZone, getZoneLayout, getZonesByConcert, updateZoneDetail, updateZoneSeat } from "../controllers/zoneControllers.js";

const router = Router();

router.post('/addzone/:id',verifyToken,isAdmin,addZone);
router.patch('/updatezone/:id',verifyToken,isAdmin,updateZoneDetail);
router.patch('/updateseat/:id',verifyToken,isAdmin,updateZoneSeat);
router.get('/allzone/:id', verifyToken, getZonesByConcert);
router.get('/seatlayout/:id', verifyToken, getZoneLayout);

export default router;