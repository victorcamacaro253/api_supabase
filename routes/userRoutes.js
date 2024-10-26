import { Router } from "express";
import userController from "../controllers/userController.js";

const router= Router();



router.get('/',userController.getUsers)


router.get('/name',userController.getUserByName)

router.get('/:id',userController.getUserById)

router.post('/add',userController.addUser)

router.delete('/:id',userController.deleteUser)



export default router;