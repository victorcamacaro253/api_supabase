import supabase from "../config/supabaseClient.js";

class imagen{


static async getImagen(imagePath){

const {data,error} = supabase
.storage
.from('uploads')
.getPublicUrl(imagePath)

if (error) {
    console.error('Error fetching image URL:', error);
    return;

}
return data.publicUrl

}
}

export default imagen;