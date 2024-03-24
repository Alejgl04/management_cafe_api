export interface BillPdfResponse {
  uuid?: string;
  name?: string;
  email?: string;
  phone?: string;
  paymentMethod?: string;
  total?: number;
  productDetails: ProductDetail[];
  createBy?: string;
  id?: number;
}

export interface ProductDetail {
  name: string;
  price: number;
  total: number;
  category: string;
  quantity: string;
}
