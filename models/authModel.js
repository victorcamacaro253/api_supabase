import supabase from "../config/supabaseClient.js";

class authenticacion {

 static signInWithGoogle = async ()=>{
    const {data,error} = await supabase.auth.signInWithOAuth({
        provider:'google'
    })

    if(error) throw new Error(error.message)
        return data 
 }
 static async saveUserToDatabase(user) {
   // console.log('victor', user);
    try {
        const { id, email, user_metadata } = user.user;
        const { full_name, avatar_url, sub } = user_metadata || {};

        if (!full_name || !email) {
            throw new Error('El nombre completo o el email del usuario no están disponibles');
        }

        // Comprobar si el usuario ya existe en la base de datos
       /* const { data: datal, error: errorl } = await supabase
            .from('usuarios')
            .select('*')
            .eq('email', email);

        if (errorl) throw new Error(errorl.message);

        if (datal.length > 0) {
            console.log('Usuario ya existe');
            return datal[0];
        }*/

        // Insertar o actualizar el usuario
        const { data, error } = await supabase
            .from('usuarios')
            .upsert({
                google_id: sub,
                email,
                nombre: full_name,
            }, { onConflict: 'id' });

        if (error) {
            console.error('Error al guardar el usuario en Supabase:', error.details || error.message);
            throw new Error('No se pudo guardar el usuario en la base de datos');
        }

        return {
            success: true,
            message: 'Usuario guardado correctamente',
            data
        };
    } catch (err) {
        console.error('Error al guardar el usuario:', err.message);
        throw new Error('Error al guardar el usuario en la base de datos');
    }
}




}


export default authenticacion