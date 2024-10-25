import User from "../models/userModel.js";


class userController {


static getUsers = async (req,res)=>{
 try {
    const result= await User.getUsers();
console.log(result)
    res.json(result)
 } catch (error) {
    res.status(500).json({ message: error.message });
    
 }


}


}

export default userController