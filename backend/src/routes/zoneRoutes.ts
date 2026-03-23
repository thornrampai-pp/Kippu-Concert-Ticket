import { Router } from "express";
import { addZone, updateZoneSeat, updateZoneDetail, getZonesByConcert, getZoneLayout, deleteZone } from "../controllers/zoneControllers";
import { verifyToken,isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.post('/addzone/:id',verifyToken,isAdmin,addZone);
router.patch('/updatezone/:id',verifyToken,isAdmin,updateZoneDetail);
router.patch('/updateseat/:id',verifyToken,isAdmin,updateZoneSeat);
router.get('/allzone/:id', verifyToken, getZonesByConcert);
router.get('/seatlayout/:id', verifyToken, getZoneLayout);
router.delete('/delete/:id',verifyToken,isAdmin,deleteZone)

export default router;