import { Router } from "express";
import { addZone, updateZoneSeat, updateZoneDetail, getZonesByConcert, getZoneLayout } from "../controllers/zoneControllers";
import { verifyToken,isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post('/addzone/:id',verifyToken,isAdmin,addZone);
router.patch('/updatezone/:id',verifyToken,isAdmin,updateZoneDetail);
router.patch('/updateseat/:id',verifyToken,isAdmin,updateZoneSeat);
router.get('/allzone/:concert_id', verifyToken, getZonesByConcert);
router.get('/zone/:zone_id', verifyToken, getZoneLayout);

export default router;