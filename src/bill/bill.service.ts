import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBillDto } from './dto/create-bill.dto';
import { UpdateBillDto } from './dto/update-bill.dto';
import { Bill } from './entities/bill.entity';
import { v4 as uuid } from 'uuid';
import { generatePDF, getBillPdf } from './helpers/';
import { BillPdfResponse } from './interfaces/billPdf-response.interfaces';

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

  async findBillById(id: string) {
    const productBillPdf = await this.billRepository.findOne({
      where: { id },
    });

    if (!getBillPdf)
      throw new NotFoundException(`Bill report with ${id} not found`);

    return await getBillPdf(productBillPdf);
  }
}
