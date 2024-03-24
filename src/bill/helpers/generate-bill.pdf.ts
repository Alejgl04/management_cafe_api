import * as fs from 'fs';
import PDFDocument from 'pdfkit-table';
import { BillPdfResponse } from '../interfaces/billPdf-response.interfaces';

export const generatePDF = async (
  data: BillPdfResponse,
  uuid?: string,
): Promise<Buffer> => {
  const pdfBuffer: Buffer = await new Promise((resolve) => {
    const doc = new PDFDocument({
      size: 'LETTER',
      bufferPages: true,
    });

    const newProduct = [];
    newProduct.push(data.productDetails);

    const clientDataTable = {
      title: 'Customer Info',
      headers: ['Name', 'Email', 'Contact Number', 'Payment Method'],
      rows: [[data.name, data.email, data.phone, data.paymentMethod]],
      options: {
        divider: {
          header: { disabled: false, width: 0.5, opacity: 0.5 },
          horizontal: { disabled: true, width: 0.5, opacity: 0.5 },
        },
      },
    };
    doc.table(clientDataTable, { width: 500 }); // A4 595.28 x 841.89 (portrait) (about width sizes)
    // move to down
    doc.moveDown(); // separate tables

    const table = {
      title: 'Product Details',
      headers: [
        { label: 'Name', property: 'name', width: 60, renderer: null },
        {
          label: 'Category',
          property: 'category',
          width: 150,
          renderer: null,
        },
        {
          label: 'Quantity',
          property: 'quantity',
          width: 100,
          renderer: null,
        },
        { label: 'Price', property: 'price', width: 100, renderer: null },
        {
          label: 'Sub. Total',
          property: 'total',
          width: 80,
          renderer: null,
        },
      ],
      datas: newProduct,
      options: {
        divider: {
          header: { disabled: false, width: 2, opacity: 1 },
          horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
        },
      },
    };

    doc.table(table, {
      prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
      prepareRow: () => doc.font('Helvetica').fontSize(8),
    });

    const buffer = [];
    doc.on('data', buffer.push.bind(buffer));
    doc.on('end', () => {
      const data = Buffer.concat(buffer);
      resolve(data);
    });
    doc.pipe(fs.createWriteStream(__dirname + `../../pdfHtml/${uuid}.pdf`));

    doc.end();
  });

  return pdfBuffer;
};
