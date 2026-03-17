import { Router } from "express";
import { getAllConcert, getConcertById,createConcert,updateConcert, getAdminConcerts } from "../controllers/concertController";
import { verifyToken,isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get('/all',getAllConcert);
router.get('/:id', verifyToken ,getConcertById);
router.post('/create',verifyToken,isAdmin,createConcert);
router.put('/update/:id',verifyToken,isAdmin,updateConcert);
router.get('/admin/all', verifyToken, isAdmin,getAdminConcerts)
export default router;