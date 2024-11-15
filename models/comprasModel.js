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


    static updateProductStock= async (id_producto,cantidad)=>{
        const { data, error } = await supabase
        .from('productos')
        .update({stock: cantidad})
        .eq('id_producto',id_producto)
        if (error) {
            console.error('Error updating data:', error);
            return null; // Manejo de errores
            }
            return data;
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


}

export default Compras