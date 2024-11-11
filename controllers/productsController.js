import productsModel from  '../models/productsModel.js';
import uploadImageSupabase from '../middleware/uploadSupabase.js';
import { randomBytes } from 'crypto';
import crypto from 'crypto'
import { validationResult } from "express-validator";
import fs from 'fs'
import csvParser from 'csv-parser';



class productController{

static getProducts = async (req,res)=>{

    try {
        const products = await productsModel.getProducts()

        if(!products){
            return res.status(404).json({msg:"Productos no encontrado"});
        }

        res.json(products);
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo productos" });
        
    }
}

//---------------------------------------------------------------------------------------------------------------------


static getProductsById = async (req,res) =>{
    const {id} =   req.params;

    try {
        const product = await  productsModel.getProductsById(id)

        if (product.length=== 0) {
            return res.status(400).json({error:message.error})
        }

        res.status(200).json(product)

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error obteniendo producto por id" });
        
    }

}

//---------------------------------------------------------------------------------------------------------------

    static getProductByName = async (req,res)=>{
        const {name} = req.query;
        try {
            const product = await productsModel.getProductsByName(name)
            if (product.length === 0) {
                return res.status(400).json({ error: message.error })
                }
                res.status(200).json(product)
                } catch (error) {
                    console.error(error);
                    res.status(500).json({ message: "Error obteniendo producto por nombre" });
                }


}


//---------------------------------------------------------------------------------------------------------------------------

  static createProduct = async (req,res)=>{
   const  {nombre_producto,precio,descripcion,id_categoria,stock,id_proveedor} = req.body;
 //  const imagen=  req.file;


 // Validar errores de validación
 const errors = validationResult(req);
 if (!errors.isEmpty()) {
   return res.status(400).json({ errors: errors.array() });
 }



   try {
     
    const existingProduct = await  productsModel.getProductsByName(nombre_producto)
    if (existingProduct.length > 0) {
        return res.status(400).json({ message:'Producto ya existe' })
        }


        const codigo= randomBytes(8).toString('hex')

    //    const imagePath= await uploadImageSupabase(imagen)

     const estatus= 'activo'

        const newProduct = await productsModel.createProduct(codigo,id_proveedor,nombre_producto,descripcion,precio,stock,id_categoria,estatus /*imagePath*/)


        res.status(201).json({message:'Producto creado exitosamente'})

    
   } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error creando producto" });

    
   }


  }

//-----------------------------------------------------------------------------------------

  static updateProduct= async  (req,res)=>{
    const {id} = req.params;
    const {nombre_producto,precio,descripcion,id_categoria,stock,id_proveedor} = req.body
    // const imagen = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
        }




        try {
            const existingProduct = await productsModel.getProductsById(id)

            if (existingProduct.length === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' })
                }

                const updateFields={}



              // Preparar los campos a actualizar
    if (nombre_producto) updateFields.nombre_producto = nombre_producto;
    if (precio) updateFields.precio = precio;
    if (descripcion) updateFields.descripcion = descripcion;
    if (id_categoria) updateFields.id_categoria = id_categoria;
    if(stock) updateFields.stock= stock;
    if(id_proveedor) updateFields.id_proveedor=id_proveedor;



                    const result= await productsModel.updateProduct(id,updateFields)



                    res.status(200).json({message:'Producto actualizado exitosamente'})


                    } catch (error) {
                        console.error(error);
                        res.status(500).json({ message: "Error actualizando producto" });
                        }
                        }

//-------------------------------------------------------------------------------------------------------


                        static deleteProduct= async (req,res)=>{
                            const {id} = req.params;
                            try {
                                const existingProduct = await productsModel.getProductsById(id)
                                if (existingProduct.length === 0) {
                                    return res.status(404).json({ message: 'Producto no encontrado' })
                                    }
                                    const newProduct = await productsModel.deleteProduct(id)
                                    res.status(200).json({message:'Producto eliminado exitosamente'})
                                    } catch (error) {
                                        console.error(error);
                                        res.status(500).json({ message: "Error eliminando producto" });
                                        }
                             }


     //------------------------------------------------------------------------------------------------------------------

     static getProductByPriceRange = async (req,res)=>{
        const {min,max}=req.query;
        try{
            const products = await productsModel.getProductByPriceRange(min,max)

            if(products.length=== 0){
                return res.status(404).json({message:'No hay productos en ese rango de precio'})
            }
            res.status(200).json(products)
            }catch(error){
                console.error(error);
                res.status(500).json({message: "Error obteniendo productos por rango de precio"});
                  
               }

            }

                
    //------------------------------------------------------------------------------------------------------------------


    static  getProductsByCategory = async (req,res)=>{
        const {category}=req.params;
        try{
            const products = await productsModel.getProductsByCategory(category)
            res.status(200).json(products)
            }catch(error){
                console.error(error);
                res.status(500).json({message: "Error obteniendo productos por categoria"});
                }
                }


    //------------------------------------------------------------------------------------------------------------------    
    
    static addMultipleProducts  = async (req,res)=>{
        let products

        if (typeof req.body.products === 'string') {
            // Convierte users de string a objeto si viene de form-data
            try {
                products = JSON.parse(req.body.products || '[]');
            } catch (error) {
                return res.status(400).json({ error: 'Invalid JSON format for users' });
            }
        } else {
            // Si ya es un array (JSON puro)
            products = req.body.products || [];
        }


    //  console.log(products)
       
  // const imagePath = req.files &&  req.files.length > 0 ? req.files[0].path : '';

  if(!Array.isArray(products)){
    return  res.status(400).json({error:'Productos debe ser un array'})

  }

  const errorsList=[];
  const createdProducts=[];
  const productsToInsert=[];

try {
     for( const product of products){
        const {nombre_producto,precio,descripcion,id_categoria,stock,id_proveedor}=product;
     

      const existingProduct= await productsModel.getProductsByName(nombre_producto);

      if(existingProduct.length>0){
        errorsList.push({message:`El producto ${nombre_producto} ya existe`})
      }

      const imageFile=  req.files[0];
   //   console.log(imageFile)
      const imagePath= await uploadImageSupabase(imageFile)

    console.log(imagePath)


      const codigo = crypto.randomBytes(4).toString('hex').toUpperCase();

      const estatus= 'activo'
      
      productsToInsert.push({
        codigo,
        id_proveedor,
        nombre_producto,
        descripcion,
        precio,
        stock,
        imagen: imagePath,
        id_categoria,
        
        estatus
        
      })


        }


           // console.log(productsToInsert)

            
                const result= await productsModel.addMultipleProducts(productsToInsert);

               
                createdProducts.push(productsToInsert)
              

              
       if (errorsList.length > 0) {
        res.status(400).json({ errorsList });
    } else {
        res.status(201).json({ createdProducts });
    }
          
} catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al crear el producto' });
    
}


    }

//------------------------------------------------------------------------------

  static getTopSelling= async (req, res) => {
    try {
        const results= await productsModel.getTopSellingProducts();
        res.json(results)
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error al obtener los productos más vendidos'})
        
    }
  }

  //---------------------------------------------------------------------------------------------------

  static importProduct = async  (req, res) => {
    const filePath= req.file.path
    const products= []

    try {
        const readStream= fs.createReadStream(filePath);
        const parseStream = readStream.pipe(csvParser())

     parseStream.on('data',async (row)=>{

     

        products.push({
            codigo: row.codigo,
            nombre_producto: row.nombre_producto,
            descripcion: row.descripcion,
            precio: parseFloat(row.precio),
            stock:parseInt(row.stock),
            id_categoria: parseInt(row.id_categoria),
            estatus:row.estatus,
            id_proveedor: parseInt(row.id_proveedor),
            imagen:row.imagen
        })

     })

     console.log(products)

     await new Promise ((resolve,reject)=>{
        parseStream.on('end',resolve)
        parseStream.on('error',reject)
     })


     const count = await  productsModel.addMultipleProducts(products)

     fs.unlinkSync(filePath)

     return res.json({message:'Productos Importados Exitosamente',count})


    } catch (error) {
        console.log('Error al procesar el archivo  o importar prodcutos',error)

        if(fs.existsSync(filePath)){
            fs.unlinkSync(filePath)
        }
        return  res.status(500).json({message:'Error al importar productos',error})

    }


}

}


export default productController