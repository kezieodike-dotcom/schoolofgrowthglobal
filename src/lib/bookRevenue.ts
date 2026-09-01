export const COMPANY_BOOK_SHARE_PERCENT = 20;
export const OWNER_BOOK_SHARE_PERCENT = 80;

export interface BookRevenueSplit {
  totalKobo: number;
  companyPercent: number;
  ownerPercent: number;
  companyShareKobo: number;
  ownerShareKobo: number;
}

export interface BookPurchase {
  reference: string;
  email: string;
  bookId: string;
  title: string;
  amountKobo: number;
  currency: string;
  ownerName: string;
  ownerEmail: string;
  ownerType: 'Admin' | 'Mentor';
  downloadUrl?: string;
  split: BookRevenueSplit;
}

export function calculateBookRevenueSplit(totalKobo: number): BookRevenueSplit {
  const total = Math.max(0, Math.round(totalKobo));
  const companyShareKobo = Math.round((total * COMPANY_BOOK_SHARE_PERCENT) / 100);

  return {
    totalKobo: total,
    companyPercent: COMPANY_BOOK_SHARE_PERCENT,
    ownerPercent: OWNER_BOOK_SHARE_PERCENT,
    companyShareKobo,
    ownerShareKobo: total - companyShareKobo,
  };
}
