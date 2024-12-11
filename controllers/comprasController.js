import Compras from '../models/comprasModel.js'
import productsModel from '../models/productsModel.js'
import supabase from '../config/supabaseClient.js';
import handleError from '../utils/handleError.js';
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
    try {
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

        // Verificar stock y preparar datos para inserción
        const insertProductos = [];
        for (const producto of productos) {
            const { id_producto, cantidad } = producto;

            // Obtener stock del producto
            const stockResponse = await productsModel.getProductStock(id_producto);
            const stock = stockResponse[0].stock; // Accede al valor del stock

            if (stock < cantidad) {
                return res.status(400).json({ error: 'Stock insuficiente para el producto con id ' + id_producto });
            }

            insertProductos.push(producto);
        }

        // Agregar compra y productos
        const id_compra = await Compras.addCompra(id_usuario, totalCompra);
        await Compras.compraProduct(id_compra, insertProductos);

        // Actualizar el stock del producto
        for (const producto of insertProductos) {
            const { id_producto, cantidad } = producto;

            const stockResponse = await productsModel.getProductStock(id_producto);
            const stockData = stockResponse[0].stock; // Accede al valor del stock
            const newStock = stockData - cantidad;

            await productsModel.updateProductStock(id_producto, newStock);

            const vendido = await productsModel.getTopSellingProductById(id_producto);
            const newVendido = vendido.vendido + cantidad;

            // Actualizar productos más vendidos
            await productsModel.updateTopSelling(id_producto, newVendido);
        }

        res.status(201).json({ id_compra, message: 'Compra realizada con éxito' });
    } catch (error) {
       handleError(res,error)
    }
};

                static getComprasByUserId = async (req, res) => {
                    const {id} = req.params

                    try {

                        const result = await Compras.getComprasByUserId(id)

                        if (result.length === 0) {
                            res.status(404).json({ message: 'No se encontraron compras para el usuario'})
                            
                        }

                        res.json(result)
                        
                    } catch (error) {
                       handleError(res,error)

                        
                    }

                }


                static getComprasCountByUsuario = async (req,res)=>{
                    try {
                        const result = await Compras.getComprasCountByUsuario()
                        
                        if(!result){
                            res.status(404).json({message:'No se encontraron compras para el usuario'})
                        }
                        res.json(result)
                        
                    } catch (error) {
                       handleError(res,error)
                        
                    }
                }

//--------------------------------------------------------------------------------------------------------------


       /*  static deleteCompra = async (req, res) => {
    const { id } = req.params;
    try {
        // Obtener los productos de la compra
        const productosCompras = await Compras.getProductosCompras(id);
        console.log(productosCompras);

        // Eliminar los productos de la base de datos
        const deleteProductosCompraPromises = productosCompras.map((product) => {
            return Compras.deleteProductoCompra(product.compras.id_compra);
        });
        const deleteProductosCompraResults = await Promise.all(deleteProductosCompraPromises);
        console.log(deleteProductosCompraResults);

        // Eliminar la compra de la base de datos
        const deleteCompra = await Compras.deleteCompra(id);
        console.log(deleteCompra);
        
            res.json({ message: 'Compra eliminada con éxito' });
        
        
    } catch (error) {
        handleError(res, error);
    }
};*/


static deleteCompra= async (req,res)=>{
    const {id} = req.params
try {

    //Obtener los productos de la compras
    const productos_compras = await Compras.getProductosCompras(id)
    console.log(productos_compras)

    //Eliminar los productos de la base de datos
    for(const products of productos_compras){
        
       const deleteProductoscompra=  await Compras.deleteProductoCompra(products.compras.id_compra)

       console.log(deleteProductoscompra)
    }

    //Eliminar la compra de la base de datos
    const deleteCompra = await Compras.deleteCompra(id)
    console.log(deleteCompra)
    
        res.json({message:'Compra eliminada con exito'})
    
        
      

} catch (error) {
    handleError(res,error)
}
 }   



 static getComprasByusername= async (req,res)=>{

    const {nombre}=req.query

    console.log(nombre)

    if (!nombre) {
      
      return res.status(400).json({ error: 'No se proporciono un nombre' });
     
    }
   
    try {
      
const result = await Compras.getComprasByUsername(nombre)

 // Imprimir el resultado completo para depuración
 console.log(JSON.stringify(result, null, 2)); // Esto mostrará el contenido completo

 if(!result){
  return    res.status(400).json({error:'No se proporciono'})
 }

  // Procesar los resultados
  const compraAgrupada = {};

  result.forEach(row => {
    if (!compraAgrupada[row.id_compra]) {
      compraAgrupada[row.id_compra] = {
        id_compra: row.id_compra,
        fecha: row.fecha,
        usuario: {
          id: row.id_usuario,
          nombre: row.nombre,
          apellido: row.apellido,
          cedula: row.cedula,
          correo: row.correo,
        },
        productos: []
      };
    }

  
        // Agregar el producto a la compra
        row.productos_compras.forEach(producto => {
            compraAgrupada[row.id_compra].productos.push({
                id_producto: producto.id_producto,
                nombre_producto:producto.productos.nombre_producto,
                cantidad: producto.cantidad,
                precio: producto.precio
            });
        });
    });

  return res.json(Object.values(compraAgrupada));


    } catch (error) {
      console.error('Error obteniendo compras por el nombre del usuario', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }

    }


}
export default comprasController 