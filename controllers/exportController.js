import User from "../models/userModel.js";
import Compras from "../models/comprasModel.js";
import Products from "../models/productsModel.js";
import XLSX from "xlsx";
import handleError from "../utils/handleError.js";
import PDFDocument from 'pdfkit' ;
import { Readable } from 'stream';
import imagen from "../models/imageModel.js";
import { Parser } from "json2csv";

class ExportController {

  static async exportUsersExcel(req, res) {
    try {
      const users = await User.getUsers();

      if (!users || users.length === 0) {
        return res.status(404).json({ message: "No se encontraron usuarios" });
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(users, {
        header: ["id", "nombre", "apellido", "cedula"],
      });

       // Ajustar automáticamente el ancho de las columnas
       const colWidths = [
        { wch: 10 }, // Ancho para "id"
        { wch: Math.max(10, ...users.map(user => user.nombre?.length || 0)) }, // Ancho para "nombre"
        { wch: Math.max(10, ...users.map(user => user.apellido?.length || 0)) }, // Ancho para "apellido"
        { wch: Math.max(10, ...users.map(user => user.cedula?.length || 0)) }, // Ancho para "cedula"
        { wch: Math.max(10, ...users.map(user => user.created_at?.length || 0))},
        { wch: Math.max(10, ...users.map(user => user.email?.length || 0))},
        { wch: Math.max(10, ...users.map(user => user.contraseña?.length || 0))},
        { wch: Math.max(10, ...users.map(user => user.imagen?.length || 0))},
        { wch: Math.max(10, ...users.map(user => user.uuid?.length || 0))},
        { wch: Math.max(10, ...users.map(user => user.google_id?.length || 0))},
        { wch: Math.max(10, ...users.map(user => user.rol?.length || 0))}

      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Disposition', 'attachment;filename="user_data.xlsx"');
      res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.status(200).send(excelBuffer);

    } catch (error) {
      handleError(res, error);
    }
  }



  static async exportUserExcel (req, res) {
   const {id} = req.params

   try {

    const user = await User.getUserById(id);

    if (!user || user.length === 0) {
        return res.status(404).json({ message: "No se encontraron usuarios" });
      }

      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet([user], {
        header: ["id", "nombre", "apellido", "cedula"],
      });

       // Ajustar automáticamente el ancho de las columnas
       const colWidths = [
        { wch: 10 }, // Ancho para "id"
        { wch: Math.max(10, ...[user.nombre].map(nombre => nombre?.length || 0)) }, // Ancho para "nombre"
        { wch: Math.max(10, ...[user.apellido].map(apellido => apellido?.length || 0)) }, // Ancho para "apellido"
        { wch: Math.max(10, ...[user.cedula].map(cedula => cedula?.length || 0)) }, // Ancho para "cedula"
        { wch: Math.max(10, ...[user.created_at].map(created_at => created_at?.length || 0))},
        { wch: Math.max(10, ...[user.email].map(email => email?.length || 0))},
        { wch: Math.max(10, ...[user.contraseña].map(contraseña => contraseña?.length || 0))},
        { wch: Math.max(10, ...[user.imagen].map(imagen => imagen?.length || 0))},
        { wch: Math.max(10, ...[user.uuid].map(uuid => uuid?.length || 0))},
        { wch: Math.max(10, ...[user.google_id].map(google_id => google_id?.length || 0))},
        { wch: Math.max(10, ...[user.rol].map(rol => rol?.length || 0))}

      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Disposition', 'attachment;filename="user_data.xlsx"');
      res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.status(200).send(excelBuffer);
    
    
   } catch (error) {
    handleError(res,error)
    
   }


  }



  static async exportUserExcelByName(req,res){
   const {nombre} = req.params

   try {

    const user = await User.getUserByName(nombre)

    if (!user || user.length===0) {
        return res.status(404).json({ message: 'Usuario no encontrado' });
        
    }

    const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.json_to_sheet(user, {
        header: ["id", "nombre", "apellido", "cedula"],
      });

       // Ajustar automáticamente el ancho de las columnas
       const colWidths = [
        { wch: 10 }, // Ancho para "id"
        { wch: Math.max(10, ...[user.nombre].map(nombre => nombre?.length || 0)) }, // Ancho para "nombre"
        { wch: Math.max(10, ...[user.apellido].map(apellido => apellido?.length || 0)) }, // Ancho para "apellido"
        { wch: Math.max(10, ...[user.cedula].map(cedula => cedula?.length || 0)) }, // Ancho para "cedula"
        { wch: Math.max(10, ...[user.created_at].map(created_at => created_at?.length || 0))},
        { wch: Math.max(10, ...[user.email].map(email => email?.length || 0))},
        { wch: Math.max(10, ...[user.contraseña].map(contraseña => contraseña?.length || 0))},
        { wch: Math.max(10, ...[user.imagen].map(imagen => imagen?.length || 0))},
        { wch: Math.max(10, ...[user.uuid].map(uuid => uuid?.length || 0))},
        { wch: Math.max(10, ...[user.google_id].map(google_id => google_id?.length || 0))},
        { wch: Math.max(10, ...[user.rol].map(rol => rol?.length || 0))}

      ];
      ws['!cols'] = colWidths;

      XLSX.utils.book_append_sheet(wb, ws, 'Usuarios');
      const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

      res.setHeader('Content-Disposition', 'attachment;filename="user_data.xlsx"');
      res.setHeader('Content-type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.status(200).send(excelBuffer);
    
   } catch (error) {
    handleError(res,error)
    
   }
  

  }
  static async exportUsersPDF(req, res) {
    try {
        const users = await User.getUsers();

        const doc = new PDFDocument();
        const stream = Readable.from(doc);

        // Configura las cabeceras para la descarga del PDF
        res.setHeader('Content-Disposition', 'attachment; filename="user_data.pdf"');
        res.setHeader('Content-Type', 'application/pdf');

        doc.fontSize(18).text('Usuarios', { align: 'center' });
        doc.moveDown();

        const tableTop = 100;
        const itemHeight = 20;
        const tableWidth = 500;

        // Encabezados de las columnas
        doc.fontSize(10)
            .text('ID', 50, tableTop)
            .text('Nombre', 100, tableTop)
            .text('Apellido', 200, tableTop)
            .text('Cédula', 300, tableTop)
            .text('Correo', 400, tableTop)
            .text('Imagen', 500, tableTop)
            .text('Created At', 550, tableTop);

        doc.moveTo(50, tableTop + itemHeight).lineTo(750, tableTop + itemHeight).stroke();

        let y = tableTop + itemHeight;

        users.forEach(user => {
            doc.text(user.id, 50, y);
            doc.text(user.nombre, 100, y);
            doc.text(user.apellido, 200, y);
            doc.text(user.cedula, 300, y);
            doc.text(user.email, 400, y);
            doc.text(user.imagen || 'Sin imagen', 500, y); // Manejo de caso sin imagen
            // Manejo de la fecha
            const createdAt = new Date(user.created_at); // Convertir a objeto Date
            doc.fontSize(10).text(createdAt.toISOString().split('T')[0], 550, y); // Formato de fecha
            y += itemHeight; // Incrementa la posición y para la siguiente fila
        });

        doc.moveTo(50, y).lineTo(750, y).stroke();

        // Finaliza el PDF y envíalo como respuesta
        doc.end();
        stream.pipe(res);
        
    } catch (error) {
        handleError(res, error);
    }
}


    static async exportUserPDF(req, res) {
      const {id}= req.params;

      try {
          // Simular la obtención de datos del usuario
          const userData = await User.getUserById(id);
  
          // Crea un documento PDF
          const doc = new PDFDocument();
  
          // Usa un stream para el buffer del PDF
          const stream = Readable.from(doc);
  
          // Configura las cabeceras para la descarga del PDF
          res.setHeader('Content-Disposition', 'attachment; filename="user_data.pdf"');
          res.setHeader('Content-Type', 'application/pdf');
  
          // Escribe en el documento PDF
          doc.text('Datos del Usuario', { align: 'center' });
          doc.text('ID: ' + userData.id);
          doc.text('Name: ' + userData.nombre);
          doc.text('Apellido: ' + userData.apellido);
          doc.text('Cedula: ' + userData.cedula);
          doc.text('Correo: ' + userData.email);
          doc.text('contraseña: ' + userData.contraseña);
          
          // Agrega más información según sea necesario
  
          // Finaliza el PDF y envíalo como respuesta
          doc.end();
          stream.pipe(res);
      } catch (error) {
          handleError(res, error);
      }
    }

    
    static async exportUserPDFByName(req, res) {
      const { nombre } = req.params;
      try {
        // Simular la obtención de datos del usuario
        const usersData = await User.getUserByName(nombre);
console.log(usersData)
        // Crea un documento PDF
        const doc = new PDFDocument();

        // Usa un stream para el buffer del PDF
        const stream = Readable.from(doc);

        // Configura las cabeceras para la descarga del PDF
        res.setHeader('Content-Disposition', 'attachment; filename="user_data.pdf"');
        res.setHeader('Content-Type', 'application/pdf');
// Título general del PDF
doc.fontSize(16).text('Datos de Usuarios', { align: 'center', underline: true });
doc.moveDown();

// Escribe los datos de cada usuario en el documento
usersData.forEach((user, index) => {
  doc.fontSize(12).text(`Usuario ${index + 1}:`, { underline: true });
  doc.text(`ID: ${user.id}`);
  doc.text(`Nombre: ${user.nombre}`);
  doc.text(`Apellido: ${user.apellido}`);
  doc.text(`Cédula: ${user.cedula}`);
  doc.text(`Correo: ${user.email}`);
  doc.text(`Contraseña: ${user.contraseña}`);
  doc.moveDown(); // Espacio entre usuarios
});
        // Finaliza el PDF y envíalo como respuesta
        doc.end();
        stream.pipe(res);

      } catch (error) {
          handleError(res, error);
      }
  }

  
static exportUsersCSV = async (req,res)=>{

  try {
   const users = await User.getUsers()


   if (!users || users.length === 0) {
       throw new Error('No users found');
   }

   const fields= ['id','nombre','apellido','cedula','email']
   const json2csvParser = new Parser({fields})
   const csv = json2csvParser.parse(users)
   res.setHeader('Content-Disposition', 'attachment; filename="user_data.csv"');
   res.setHeader('Content-Type', 'text/csv');
   res.send(csv);

  } catch (error) {
   console.error('Error al exportar los datos del usuario a CSV:', error);
       res.status(500).json({ error: 'Error interno del servidor' });
  }
}



static exportUserCSV = async (req,res)=>{
  const {id}= req.params
   try {
    const users = await User.getUserById(id)


    if (!users || users.length === 0) {
        throw new Error('No users found');
    }

    const fields= ['id','nombre','apellido','cedula','email']
    const json2csvParser = new Parser({fields})
    const csv = json2csvParser.parse(users)
    res.setHeader('Content-Disposition', 'attachment; filename="user_data.csv"');
    res.setHeader('Content-Type', 'text/csv');
    res.send(csv);
 
   } catch (error) {
    console.error('Error al exportar los datos del usuario a CSV:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
   }
}

 
//------------------------------------------------------------------------------------------------------------
//'-------------------------------------------------------------------------------------------------------------


 

static exportComprasDataByName= async (req,res)=>{
  const {nombre} = req.query

  try {
      const comprasByUser= await Compras.getComprasByUsername(nombre)
      console.log(comprasByUser)
      if (!comprasByUser || comprasByUser.length === 0) {
          throw new Error('No users found');
      }



   // Agrupar las compras
   const groupedPurchases = {};

   comprasByUser.forEach(row => {
       if (!groupedPurchases[row.id_compra]) {
           // Si aún no existe la compra, la crea
           groupedPurchases[row.id_compra] = {
               id_compra: row.id_compra,
               fecha: row.fecha,
               total:row.total_compra,
               nombre: row.nombre,
               apellido: row.apellido,
               cedula: row.cedula,
               correo: row.correo,
               productos: [] // Inicializa el array de productos
           };
       }

        // Agregar el producto a la compra
        row.productos_compras.forEach(producto => {
          groupedPurchases[row.id_compra].productos.push({
                id_producto: producto.id_producto,
                nombre_producto:producto.productos.nombre_producto,
                cantidad: producto.cantidad,
                precio: producto.precio
            });
        });
    });



   // Convertir el objeto agrupado en un array
   const finalPurchases = Object.values(groupedPurchases).map(purchase => ({
      ...purchase,
      productos: purchase.productos.map(product => `ID: ${product.id_producto},nombre:${product.nombre_producto}, Cantidad: ${product.cantidad}, Precio: ${product.precio}`).join('; ')
  }));





        // Create a new workbook
        const wb = XLSX.utils.book_new();

        // Create a worksheet from user data
        const ws = XLSX.utils.json_to_sheet(finalPurchases, {
          header: ['id_compra', 'fecha', 'nombre', 'apellido', 'cedula', 'correo', 'productos']
        });

        // Append the worksheet to the workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Usuario Compras');

        // Convert workbook to buffer
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

        
      res.setHeader('Content-Disposition', 'attachment; filename="user_data.xlsx"');
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.send(excelBuffer);


        return excelBuffer;
      
  } catch (error) {
      handleError(res,error)
  }
}
static exportComprasByDate = async (req, res) => {
  const { startDate, endDate } = req.query;
  if (!startDate || !endDate) {
    return res.status(400).json({ error: 'Se requieren start y end' });
  }

  const formattedStartDate = new Date(startDate).toISOString();
  const formattedEndDate = new Date(endDate).toISOString();

  if (isNaN(Date.parse(formattedStartDate)) || isNaN(Date.parse(formattedEndDate))) {
    return res.status(400).json({ error: 'Fechas invalidas' });
  }

  if (new Date(formattedStartDate) > new Date(formattedEndDate)) {
    return res.status(400).json({ error: 'La fecha de inicio debe ser anterior a la fecha de fin' });
  }

  try {
    const compras = await Compras.findByDateRange(formattedStartDate, formattedEndDate);
    console.log(compras);

    // Desestructurar los datos de productos_compras
    const comprasConProductos = compras.map(compra => {
      return {
        ...compra,
        productos_compras: compra.productos_compras.map(producto => {
          return {
            id_producto: producto.id_producto,
            nombre_producto: producto.nombre_producto,
            cantidad: producto.cantidad,
            precio: producto.precio
          };
        })
      };
    });

    // Agrupar las compras
    const groupedPurchases = {};

    comprasConProductos.forEach(row => {
      if (!groupedPurchases[row.id_compra]) {
        // Si aún no existe la compra, la crea
        groupedPurchases[row.id_compra] = {
          id_compra: row.id_compra,
          fecha: row.fecha,
          total: row.total_compra,
          nombre: row.usuarios.nombre,
          apellido: row.usuarios.apellido,
          cedula: row.usuarios.cedula,
          email: row.usuarios.email,
          productos: [] // Inicializa el array de productos
        };
      }

      // Agregar los productos a la lista de productos
      row.productos_compras.forEach(producto => {
        groupedPurchases[row.id_compra].productos.push({
          id_producto: producto.id_producto,
          nombre_producto: producto.nombre_producto,
          cantidad: producto.cantidad,
          precio: producto.precio
        });
      });
    });

    // Convertir el objeto agrupado en un array
    const finalPurchases = Object.values(groupedPurchases).map(purchase => ({
      ...purchase,
      productos: purchase.productos.map(product => `ID: ${product.id_producto}, nombre: ${product.nombre_producto}, Cantidad: ${product.cantidad}, Precio: ${product.precio}`).join('; ')
    }));

    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();

    // Crear una hoja de trabajo a partir de los datos de usuario
    const ws = XLSX.utils.json_to_sheet(finalPurchases);

    // Agregar la hoja de trabajo al libro
    XLSX.utils.book_append_sheet(wb, ws, 'Usuario Compras');

    // Convertir el libro de trabajo a un buffer
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'buffer' });

    res.setHeader('Content-Disposition', 'attachment; filename="user_data.xlsx"');
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.send(excelBuffer);

    return excelBuffer;

  } catch (error) {
    handleError(res, error);
  }
};
}

export default ExportController;