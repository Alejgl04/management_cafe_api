import * as fs from 'fs';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { Bill } from './entities/bill.entity';
import { v4 as uuid } from 'uuid';
import PDFDocument from 'pdfkit-table';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
  ) {}

  async create(createBillDto: CreateBillDto) {
    const orderDetails = createBillDto;
    const productDetail = JSON.parse(orderDetails.productDetails);
    const uidFile: string = uuid();

    try {
      const billReport = this.billRepository.create({
        ...orderDetails,
        uuid: uidFile,
        productDetails: productDetail,
      });
      // await this.billRepository.save(billReport);
      const data = {
        productDetails: productDetail,
        name: orderDetails.name,
        email: orderDetails.email,
        phone: orderDetails.phone,
        paymentMethod: orderDetails.paymentMethod,
        total: orderDetails.total,
      };
      this.generatePDF(data, uidFile);
      // return billReport;
    } catch (error) {
      console.log(error);
    }
  }

  findAll() {
    return `This action returns all bill`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bill`;
  }

  update(id: number, updateBillDto: UpdateBillDto) {
    return `This action updates a #${id} bill`;
  }

  remove(id: number) {
    return `This action removes a #${id} bill`;
  }

  async generatePDF(data: any, uuid: string): Promise<Buffer> {
    const pdfBuffer: Buffer = await new Promise((resolve) => {
      const doc = new PDFDocument({
        size: 'LETTER',
        bufferPages: true,
      });

      const clientDataTable = {
        title: 'Customer Info',
        headers: ['Name', 'Email', 'Contact Number', 'Payment Method'],
        rows: [[data.name, data.email, data.phone, data.paymentMethod]],
      };
      doc.table(clientDataTable, { width: 500 }); // A4 595.28 x 841.89 (portrait) (about width sizes)
      // move to down
      doc.moveDown(); // separate tables

      const productDetailPdf = [];
      data.productDetails.forEach((product: any) => {
        console.log(productDetailPdf.push(product));
        console.log(productDetailPdf);
      });
      console.log(data.productDetails);
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
        datas: data.productDetails,
        options: {
          divider: {
            header: { disabled: false, width: 2, opacity: 1 },
            horizontal: { disabled: false, width: 0.5, opacity: 0.5 },
          },
        },
      };

      doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
        prepareRow: (row, indexColumn, indexRow, rectRow) =>
          doc.font('Helvetica').fontSize(8),
      });

      const buffer = [];
      doc.on('data', buffer.push.bind(buffer));
      doc.on('end', () => {
        const data = Buffer.concat(buffer);
        resolve(data);
      });
      doc.pipe(fs.createWriteStream(__dirname + `/pdfHtml/${uuid}.pdf`));

      doc.end();
    });

    return pdfBuffer;
  }
}
