import Compras from '../models/comprasModel.js'
import productsModel from '../models/productsModel.js'
import supabase from '../config/supabaseClient.js';
class comprasController {

    static getCompras = async (req, res) => {
        try {
            const result = await Compras.getCompras();
    
            if (!result) {
                return res.status(500).json({ error: 'Error al obtener datos' });
            }
    
            const compraAgrupada = new Map();
    
            for (const row of result) {
                const { 
                    id_compra, 
                    cantidad, 
                    precio, 
                    productos, // Esto es un objeto
                    compras 
                } = row;
    
                // Extrae datos de la compra
                const { fecha, total_compra, usuarios } = compras;
    
                if (!compraAgrupada.has(id_compra)) {
                    compraAgrupada.set(id_compra, {
                        id_compra,
                        fecha,
                        total: total_compra,
                        usuario: usuarios ? {
                            id: usuarios.id,
                            nombre: usuarios.nombre,
                            apellido: usuarios.apellido,
                            cedula: usuarios.cedula,
                            correo: usuarios.email,
                        } : {}, // Manejo de caso donde no hay usuario
                        productos: [],
                    });
                }
    
                // Agrega el producto como un objeto
                compraAgrupada.get(id_compra).productos.push({
                    id_producto: productos.id_producto, // Accede directamente a las propiedades del objeto
                    nombre: productos.nombre_producto,
                    cantidad,
                    precio,
                });
            }
    
            // Convertir a array y enviar como respuesta
            return res.json([...compraAgrupada.values()]);
        } catch (error) {
            console.error('Error ejecutando la consulta', error);
            return res.status(500).json({
                error: 'Error interno del servidor',
                details: error.message,
            });
        }
    };



 static getCompraById= async (req, res) => {
    try {
        const {id} = req.params;

        const result= await Compras.getCompraById(id)
        
        if (!result) {
            return res.status(500).json({ error: 'Error al obtener datos' });
        }

        const compraAgrupada = new Map();

        for (const row of result) {
            const { 
                id_compra, 
                cantidad, 
                precio, 
                productos, // Esto es un objeto
                compras 
            } = row;

            // Extrae datos de la compra
            const { fecha, total_compra, usuarios } = compras;

            if (!compraAgrupada.has(id_compra)) {
                compraAgrupada.set(id_compra, {
                    id_compra,
                    fecha,
                    total: total_compra,
                    usuario: usuarios ? {
                        id: usuarios.id,
                        nombre: usuarios.nombre,
                        apellido: usuarios.apellido,
                        cedula: usuarios.cedula,
                        correo: usuarios.email,
                    } : {}, // Manejo de caso donde no hay usuario
                    productos: [],
                });
            }

            // Agrega el producto como un objeto
            compraAgrupada.get(id_compra).productos.push({
                id_producto: productos.id_producto, // Accede directamente a las propiedades del objeto
                nombre: productos.nombre_producto,
                cantidad,
                precio,
            });
        }

        // Convertir a array y enviar como respuesta
        return res.json([...compraAgrupada.values()]);


        } catch (error) {
            console.error('Error ejecutando la consulta', error);
            return res.status(500).json({
                error: 'Error interno del servidor',
                details: error.message,
                });


                }


                }
        
                static compraProduct = async (req, res) => {
                    const { id_usuario, productos } = req.body;
                
                    // Validar entrada
                    if (!id_usuario || !productos || !Array.isArray(productos) || productos.length === 0) {
                        return res.status(400).json({ error: 'El usuario y al menos un producto son requeridos' });
                    }
                
                    // Validar productos y calcular total
                    let totalCompra = 0;
                    for (const producto of productos) {
                        const { id_producto, cantidad, precio } = producto;
                        if (!id_producto || !cantidad || !precio || isNaN(cantidad) || cantidad <= 0 || isNaN(precio) || precio <= 0) {
                            return res.status(400).json({ error: 'Datos de producto inválidos' });
                        }
                        totalCompra += cantidad * precio; // Sumar al total
                    }
                
                    try {
                        // Verificar stock y preparar datos para inserción
                        const insertProductos = [];
                        for (const producto of productos) {
                            const { id_producto, cantidad } = producto;
                
                            // Obtener stock del producto
                         const stock = await productsModel.getProductStock(id_producto)
                         console.log(stock)
                         console.log(cantidad)

                            if (stock < cantidad) {
                                return res.status(400).json({ error: 'Stock insuficiente para el producto con id ' + id_producto });
                            }
                
                            insertProductos.push(producto);
                        }
                
                        // Insertar la compra
                       /* const { data: compraData, error: compraError } = await supabase
                            .from('compras')
                            .insert([{ id_usuario, totalCompra }])
                            .select('id_compra')
                            .single();
                
                        if (compraError) {
                            throw new Error('Error al insertar la compra: ' + compraError.message);
                        }
                            
                
                        const id_compra = compraData.id_compra;
                        */
                       const id_compra = await Compras.addCompra(id_usuario,totalCompra)
                
console.log('id_compras:',id_compra)
                    await Compras.compraProduct(id_compra,insertProductos)
                
                        // Actualizar el stock del producto
                        for (const producto of insertProductos) {
                            const { id_producto, cantidad } = producto;
                
                            // Actualizar stock
                            const { data: stockData, error: updateError } = await supabase
                                .from('productos')
                                .select('stock')
                                .eq('id_producto', id_producto)
                                .single();
                
                            if (updateError) {
                                throw new Error('Error al obtener el stock: ' + updateError.message);
                            }
                console.log('nuevo',stockData)
                            const newStock = stockData.stock - cantidad;
                
                            // Actualizar el stock en la base de datos
                            const { error: updateStockError } = await supabase
                                .from('productos')
                                .update({ stock: newStock })
                                .eq('id_producto', id_producto);
                
                            if (updateStockError) {
                                throw new Error('Error al actualizar el stock: ' + updateStockError.message);
                            }
                
                            // Actualizar productos más vendidos
                            await productsModel.updateTopSelling(id_producto, cantidad);
                        }
                
                        res.status(201).json({ id_compra, message: 'Compra realizada con éxito' });
                
                    } catch (err) {
                        console.error('Error ejecutando la transacción:', err);
                        // Aquí puedes implementar lógica para revertir cambios si es necesario
                        res.status(500).json({ error: 'Error interno del servidor' });
                    }
                };

}
export default comprasController 