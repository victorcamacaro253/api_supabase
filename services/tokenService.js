import jwt from 'jsonwebtoken'


const generateToken = (userId,email)=>{
    const token=  jwt.sign(
     {   id:userId,email:email  },
     process.env.JWT_SECRET,
     {expiresIn: '1h'}
        

    )
    return token
}


const verifyToken = (token) =>{
    try{

        const decode = jwt.verify(token, process.env.JWT_SECRET);
        return decode.id; //Retorna el id del usuario 
      }catch(error){
          return null  
        }

}

export default{generateToken,verifyToken}