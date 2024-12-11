import supabase from "../config/supabaseClient.js";


class Compras {
    static getCompras = async () => {
        const { data, error } = await supabase
            .from('productos_compras')
            .select(`
                id_compra,
                cantidad,
                precio,
                productos (
                    id_producto,
                    nombre_producto
                ),
                compras (
                    fecha,
                    total_compra,
                    usuarios (
                        id,
                        nombre,
                        apellido,
                        cedula,
                        email
                    )
                )
            `);
    
        if (error) {
            console.error('Error fetching data:', error);
            return null; // Manejo de errores
        }
    
        return data;
    }

    static getCompraById = async (id) => {
        const { data, error } = await supabase
            .from('productos_compras')
            .select(`
                id_compra,
                cantidad,
                precio,
                productos (
                    id_producto,
                    nombre_producto
                ),
                compras (
                    fecha,
                    total_compra,
                    usuarios (
                        id,
                        nombre,
                        apellido,
                        cedula,
                        email
                    )
                )
            `)
            .eq('id_compra',id)
    
        if (error) {
            console.error('Error fetching data:', error);
            return null; // Manejo de errores
        }
    
        return data;
    }


    static getProductStock = async (id_producto)=>{
   
        const { data, error } = await supabase
        .from('productos')
        .select('stock')
        .eq('id_producto',id_producto)
        .single()
        if (error) {
            console.error('Error fetching data:', error);
            return null; // Manejo de errores
            }
            return data.stock;
    }
 
    static addCompra= async(id_usuario,totalCompra)=>{

         const { data, error } = await supabase
         .from('compras')
         .insert([
            {
                fecha: new Date(),
                id_usuario,
                total_compra: totalCompra,
                
                }
                ])
                .select('id_compra')
                 .single()
                if (error) {
                    console.error('Error fetching data:', error);
                    return null; // Manejo de errores
                    }
                    return data.id_compra;

    }


   

            // Agregar productos a la compra
static  compraProduct=async  (id_compra, productos)=> {
    const values = productos.map(producto => ({
        id_compra: id_compra,
        id_producto: producto.id_producto,
        cantidad: producto.cantidad,
        precio: producto.precio
    }));

    const { data, error } = await supabase
        .from('productos_compras')
        .insert(values);

    if (error) {
        throw new Error(`Error al agregar productos: ${error.message}`);
    }

    return data; // Devuelve los datos insertados si es necesario
}

static getComprasByUserId = async (id_usuario) => {
    const { data, error } = await supabase
        .from('compras')
        .select(`
            id_compra,
            fecha,
            total_compra,
            productos_compras (
                id_producto,
                cantidad,
                precio,
                productos (
                    nombre_producto
                )
            )
        `)
        .eq('id_usuario', id_usuario)
        .order('fecha', { ascending: true });

    if (error) {
        console.error('Error fetching data:', error);
        return null; // Manejo de errores
    }

    return data; // Devuelve un arreglo de compras con productos
}


static async getComprasCountByUsuario() {
    const { data, error } = await supabase
        .from('usuarios') // Nombre de la tabla de usuarios
        .select(`
            id,
            nombre,
            compras (
                id_compra
            )
        `)
        .gt('compras.id_compra', 0); // Filtrar solo usuarios con compras

    if (error) {
        console.error('Error obteniendo el conteo de compras por usuario:', error);
        throw error; // Lanza el error para manejarlo en el controlador
    }

    // Procesar los datos para contar las compras
    const result = data.map(usuario => ({
        id: usuario.id,
        nombre: usuario.nombre,
        cantidad_compras: usuario.compras.length // Contar las compras
    }));

    return result;
}

 static async getProductosCompras(id_compra) {
    // Realizar la consulta a la base de datos
    const { data, error } = await supabase
        .from('productos_compras') // Nombre de la tabla principal
        .select(`
            cantidad,
            productos (
               id_producto,
                nombre_producto,
                descripcion,
                precio
            ),
            compras(
            id_compra
            )
        `) // Seleccionar los campos deseados de productos
        .eq('id_compra', id_compra); // Filtrar por id_compra

    // Manejar errores
    if (error) {
        console.error('Error fetching productos:', error);
        return null; // O manejar el error de otra manera
    }

    return data; // Retornar los resultados
}


 static async deleteProductoCompra(id){
    // Realizar la consulta a la base de datos
    const { data, error } = await supabase
    .from('productos_compras')
    .delete()
    .eq('id_compra', id)
    
    if(error){
        console.error('Error eliminando producto de la compra:', error);
        throw new Error(error.message);
    }
    return data

 }


 static deleteCompra = async (id)=>{

    const { data, error } = await supabase
    .from('compras')
    .delete()
    .eq('id_compra', id);
    if (error) {
        console.error('Error eliminando la compra:', error);
        throw new Error(error.message);
    
 }
    
        return data;
 }


 static async getComprasByUsername(username) {
    console.log('Buscando usuario:', username);
    
    // Primero, obtener el id del usuario por su nombre
    const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('id, nombre, apellido, cedula, email') // Asegúrate de seleccionar los campos que necesitas
        .eq('nombre', username);

    if (usuarioError) {
        console.error('Error obteniendo el usuario por nombre:', usuarioError);
        return null; // Manejo de errores
    }

    // Verificar si se encontraron usuarios
    if (!usuarioData || usuarioData.length === 0) {
        console.warn('No se encontró un usuario con el nombre:', username);
        return []; // Retorna un array vacío si no se encuentra el usuario
    }

    // Obtener el id del primer usuario encontrado
    const id_usuario = usuarioData[0].id; // Acceder al primer elemento del array
    const usuarioInfo = usuarioData[0]; // Guardar la información del usuario

    // Ahora, obtener las compras del usuario
    const { data, error } = await supabase
        .from('compras')
        .select(`
            id_compra,
            fecha,
            total_compra,
            productos_compras (
                id_producto,
                cantidad,
                precio,
                productos (
                    nombre_producto
                )
            )
        `)
        .eq('id_usuario', id_usuario)
        .order('fecha', { ascending: true });

    if (error) {
        console.error('Error obteniendo las compras del usuario:', error);
        return null; // Manejo de errores
    }

    // Agregar la información del usuario a cada compra
    const comprasConUsuario = data.map(compra => ({
        ...compra,
        nombre: usuarioInfo.nombre,
        apellido: usuarioInfo.apellido,
        cedula: usuarioInfo.cedula,
        email: usuarioInfo.email
    }));

    return comprasConUsuario; 
}
static async findByDateRange(startDate, endDate) {
    const { data, error } = await supabase
      .from('compras')
      .select(`
        id_compra,
        fecha,
        total_compra,
        usuarios(id, nombre, apellido, cedula, email),
        productos_compras(id_producto, cantidad, precio, productos(nombre_producto))
      `)
      .gte('fecha', startDate)
    .lte('fecha', endDate);
  
    if (error) {
      throw error;
    }
  
    return data;
  }
}

export default Compras