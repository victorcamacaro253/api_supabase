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


//Ruta para exportar las compras por nombre de usuario en excel

router.get('/Excel/compras/name',exportController.exportComprasDataByName)

//Ruta para exportar las compras por fecha en excel

router.get('/Excel/compras/date',exportController.exportComprasByDate)
/*
//Ruta para exportar las compras por id de usuario en excel

router.get('/Excel/compras/:id',exportControllers.exportComprasUserData);

//Ruta para exportar todsas las compras en excel

router.get('/Excel/compras',exportControllers.exportComprasData)

//Ruta para exportar las compras por fecha para el usuario en excel

router.get('/export/Excel/compras/:id/userFecha',exportControllers.exportComprasUserDate)


//Ruta para exportar las compras por nombre de usuario en Pdf

router.get('/PDF/compras/name',exportControllers.exportComprasDataByNamePdf)

//Ruta para exportar todsas las compras en pdf

router.get('/PDF/compras',exportControllers.exportComprasDataPdf)

//Ruta para exportar las compras por fecha en pdf

router.get('/PDF/compras/date',exportControllers.exportComprasByDatePdf)

//Ruta para exportar las compras por fecha para el usuario en pdf

router.get('/PDF/compras/:id/userFecha',exportControllers.exportComprasUserDatePdf)


*/
export default router;