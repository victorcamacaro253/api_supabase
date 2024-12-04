import { Router } from "express";
import exportController from "../controllers/exportController.js";


const router = Router();


router.get('/Excel/users',exportController.exportUsersExcel)

router.get('/Excel/users/:id',exportController.exportUserExcel)

router.get('/Excel/users/name/:nombre',exportController.exportUserExcelByName)

router.get('/PDF/users',exportController.exportUsersPDF)

router.get('/PDF/users/:id',exportController.exportUserPDF)

router.get('/PDF/users/name/:nombre',exportController.exportUserPDFByName)

router.get('/CSV/users/',exportController.exportUsersCSV)

router.get('/CSV/users/:id',exportController.exportUserCSV)



export default router;