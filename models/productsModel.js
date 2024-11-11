import supabase from "../config/supabaseClient.js";


class Product {


 static getProducts = async  () => {
    const { data, error } = await supabase
    .from('productos')
    .select(`*,
      
      proveedor(
     
      nombre),
      categorias (
     
      categoria
      )
      
      
      `)
    .order('id_producto', { ascending: true })
    
    
    if (error) {
        console.error(error);
        }


        return data;
        
    }


  static getProductsById= async (id)=>{

  try {
    const { data, error } = await supabase
    .from('productos')
    .select(`*,
      
      proveedor(
     
      nombre),
      categorias (
     
      categoria
      )
      
      
      `)
    .eq('id_producto', id)
    .single()
    if (error) {
        console.error(error);
        }
     return data;
        
    
  } catch (error) {
    console.error(error);
    return error;
    
  }


  }


   static getProductsByName = async (name)=>{
    try {
        const { data, error } = await supabase
        .from('productos')
        .select(`*,
      
      proveedor(
     
      nombre),
      categorias (
     
      categoria
      )
      
      
      `)
        .ilike('nombre_producto', `%${name}%`)
        .order('id_producto', { ascending: false })
        if (error) {
            console.error(error);
            }
            return data;

   }catch(error){
    console.error(error);
    return error;
   }



}

static createProduct = async  (codigo,id_proveedor,nombre_producto,descripcion,precio,stock,id_categoria,estatus) => {
  try {
    const { data, error } = await supabase
    .from('productos')
    .insert([
      {
        codigo,
        id_proveedor,
        nombre_producto,
        descripcion,
        precio,
        stock,
        id_categoria,
        estatus
        }
        ]
        );


        if (error) {
          console.error(error);
          }



          return data;


          } catch (error) {
            console.error(error);
            return error;
          }
  


        }


        static deleteProduct  = async (id) => {
          try {
            const { data, error } = await supabase
            .from('productos')
            .delete()
            .eq('id_producto', id)
            .select()
            
            if(error) throw new  Error (error.message)
              return data;


            }catch(error){
              console.error(error);
              return error;

            }

          }

            static updateProduct = async  (id, updateFields) => {
              try {
                const { data, error } = await supabase
                .from('productos')
                .update(updateFields)
                .eq('id_producto', id)
                .select()
                if (error) throw new Error(error.message)
                  return data;
                } catch (error) {
                  console.error(error);
                  return error;
                  }


          }



          //----------------------------------------------------------------------------------------------------------------

          static getProductByPriceRange = async (minPrice, maxPrice) => {
            try {
                const { data, error } = await supabase
                    .from('productos')
                    .select(`*,
      
                   proveedor(
     
                   nombre),
                   categorias (
     
                   categoria
                     )
          
                     `)
                    .gte('precio', minPrice) // Mayor o igual que minPrice
                    .lte('precio', maxPrice); // Menor o igual que maxPrice
        
                if (error) throw new Error(error.message);
                return data;
            } catch (error) {
                console.error(error);
                return error;
            }
        }


  //------------------------------------------------------------------------------------------------------------------------
  
  static addMultipleProducts  = async (products) => {

    console.log('modelo',products)
    try {
      const { data, error } = await supabase
      .from('productos')
      .insert(products)
      if (error) throw new Error(error.message)
        return data;
      } catch (error) {
        console.error(error);
        return error;
        }
        }

//---------------------------------------------------------------------


static getTopSellingProducts = async ()=>{
  const {data , error} = await supabase
  .from('productos')
  .select('id_producto, nombre_producto, precio, vendido')
  .order('vendido', { ascending: false });

  if (error) {
    console.error('Error fetching top-selling products:', error);
    return null;  
}

return data

}


}


export default  Product;
