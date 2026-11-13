export interface ManualItemInput {
  productName: string;
  quantity: number;
  unitPriceRupees: number;
  note?: string;
}

export interface UrlItemInput {
  productURL: string;
  productName: string;
  quantity: number;
  unitPriceRupees: number;
  note?: string;
}
