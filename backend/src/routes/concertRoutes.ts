import { Router } from "express";
import { getAllConcert, getConcertById,createConcert,updateConcert } from "../controllers/concertController";
import { verifyToken,isAdmin } from "../middlewares/authMiddleware";

const router = Router();

router.get('/all',getAllConcert);
router.get('/:id', verifyToken ,getConcertById);
router.post('/create',verifyToken,isAdmin,createConcert);
router.put('/update/:id',verifyToken,isAdmin,updateConcert);

export default router;