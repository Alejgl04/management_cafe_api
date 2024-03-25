import * as fs from 'fs';

import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillDto } from './dto/create-bill.dto';
import { Bill } from './entities/bill.entity';
import { v4 as uuid } from 'uuid';
import { generatePDF, getBillPdf } from './helpers/';
import { BillPdfResponse } from './interfaces/billPdf-response.interfaces';
import { User } from '../auth/entities/user.entity';

@Injectable()
export class BillService {
  constructor(
    @InjectRepository(Bill)
    private readonly billRepository: Repository<Bill>,
  ) {}

  async create(createBillDto: CreateBillDto, user: User) {
    const orderDetails = createBillDto;
    const productDetail = JSON.parse(orderDetails.productDetails);
    const uidFile: string = uuid();

    try {
      const billReport = this.billRepository.create({
        ...orderDetails,
        uuid: uidFile,
        productDetails: productDetail,
        user: user,
      });
      await this.billRepository.save(billReport);

      const data: BillPdfResponse = {
        productDetails: productDetail,
        name: orderDetails.name,
        email: orderDetails.email,
        phone: orderDetails.phone,
        paymentMethod: orderDetails.paymentMethod,
        total: orderDetails.total,
      };
      await generatePDF(data, uidFile);
      return billReport;
    } catch (error) {
      throw new BadRequestException(`Bill cannot be generated, ${error}`);
    }
  }

  findAll() {
    return this.billRepository.find();
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    fs.unlinkSync(__dirname + `/pdfHtml/${id}.pdf`);
    await this.billRepository.remove(product);

    return {
      ok: true,
      message: 'Bill removed successfully',
    };
  }

  async findBillById(id: string) {
    const productBillPdf = await this.findOne(id);
    return await getBillPdf(productBillPdf);
  }

  async findOne(id: string) {
    const productBillPdf = await this.billRepository.findOne({
      where: { uuid: id },
    });
    if (!productBillPdf)
      throw new NotFoundException(`Bill report with ${id} not found`);

    return productBillPdf;
  }
}
