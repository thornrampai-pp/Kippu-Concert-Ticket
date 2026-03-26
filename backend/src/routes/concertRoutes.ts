import { Router } from "express";
import { isAdmin, verifyToken } from "../middlewares/authMiddleware.js";
import { createConcert, getAdminConcerts, getAllConcert, getConcertById, updateConcert } from "../controllers/concertController.js";

const router = Router();

router.get('/all',getAllConcert);
router.get('/:id', verifyToken ,getConcertById);
router.post('/create',verifyToken,isAdmin,createConcert);
router.put('/update/:id',verifyToken,isAdmin,updateConcert);
router.get('/admin/all', verifyToken, isAdmin,getAdminConcerts)
export default router;