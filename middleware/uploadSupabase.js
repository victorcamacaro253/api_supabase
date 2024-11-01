import supabase from "../config/supabaseClient.js";

/**
 * Funcion para subir una imagen a Supabase storage
 * @param {Object} imageFile
 * @returns {String}
 */


const uploadImageSupabase= async  (imageFile) => {

    if(!imageFile){
        return null
    }

    let imagePath = null;


 try {
    
     const  { data, error:uploadError } = await supabase.storage
     .from('uploads')
     .upload(`uploads/${imageFile.originalname}`,imageFile.buffer,{
        cacheControl:'3600',
        upsert:false
     })

     if(uploadError){
        console.error('Error al subir imagen',uploadError)
        return null
     }

    imagePath= data.path

    return imagePath

 } catch (error) {
    console.error(error);

    
 }

}
export default uploadImageSupabase