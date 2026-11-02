export type ExpenseCategory =
  | 'stay'        // ที่พัก
  | 'food'        // อาหาร & เครื่องดื่ม
  | 'transport'   // เดินทาง & ค่าน้ำมัน
  | 'cafe'        // คาเฟ่ & ของหวาน
  | 'activity'    // กิจกรรม & ท่องเที่ยว
  | 'shopping'    // ช้อปปิ้ง & ของฝาก
  | 'other';      // อื่นๆ

export interface Member {
  id: string;
  name: string;
  nickname?: string;
  avatarColor: string;
  promptpay?: string; // เบอร์พร้อมเพย์ หรือเลขบัตร ปชช.
  bankName?: string;
  bankAccount?: string;
}

export type SplitType = 'equal_all' | 'equal_selected' | 'exact_amounts';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  date: string; // YYYY-MM-DD
  payerId: string; // Member ID who paid
  splitType: SplitType;
  participantIds: string[]; // List of member IDs involved
  customAmounts?: Record<string, number>; // memberId -> exact amount (for exact_amounts)
  notes?: string;
}

export interface Trip {
  id: string;
  title: string;
  dates: string;
  location: string;
  currency: string;
  members: Member[];
  expenses: Expense[];
  updatedAt: string;
}

export interface MemberBalance {
  memberId: string;
  member: Member;
  totalPaid: number;      // ยอดเงินที่ออกไปก่อน
  totalShare: number;     // ยอดที่ต้องรับผิดชอบ
  netBalance: number;     // totalPaid - totalShare (+คือได้คืน, -คือต้องจ่ายเพิ่ม)
}

export interface SettlementTransaction {
  id: string;
  fromMemberId: string;
  toMemberId: string;
  fromMember: Member;
  toMember: Member;
  amount: number;
}
