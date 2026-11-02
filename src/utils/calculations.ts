import { Trip, Member, Expense, MemberBalance, SettlementTransaction, ExpenseCategory } from '../types';

export function formatCurrency(amount: number, currency = '฿'): string {
  return `${amount.toLocaleString('th-TH', { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`;
}

/**
 * Returns how much each member owes for a specific expense
 */
export function calculateExpenseShares(expense: Expense, allMembers: Member[]): Record<string, number> {
  const shares: Record<string, number> = {};
  allMembers.forEach(m => { shares[m.id] = 0; });

  if (expense.splitType === 'exact_amounts') {
    if (expense.customAmounts) {
      for (const [memberId, amount] of Object.entries(expense.customAmounts)) {
        shares[memberId] = amount;
      }
    }
    return shares;
  }

  const participants = expense.splitType === 'equal_all' 
    ? allMembers.map(m => m.id)
    : (expense.participantIds.length > 0 ? expense.participantIds : allMembers.map(m => m.id));

  if (participants.length === 0) return shares;

  const perPersonShare = expense.amount / participants.length;
  for (const memberId of participants) {
    shares[memberId] = perPersonShare;
  }

  return shares;
}

/**
 * Calculates total paid, total share, and net balance for each member
 */
export function calculateBalances(trip: Trip): MemberBalance[] {
  const balances: Record<string, { totalPaid: number; totalShare: number }> = {};

  trip.members.forEach(m => {
    balances[m.id] = { totalPaid: 0, totalShare: 0 };
  });

  for (const expense of trip.expenses) {
    // Add to payer's totalPaid
    if (balances[expense.payerId]) {
      balances[expense.payerId].totalPaid += expense.amount;
    }

    // Add shares for each participant
    const shares = calculateExpenseShares(expense, trip.members);
    for (const [memberId, shareAmount] of Object.entries(shares)) {
      if (balances[memberId]) {
        balances[memberId].totalShare += shareAmount;
      }
    }
  }

  return trip.members.map(member => {
    const data = balances[member.id] || { totalPaid: 0, totalShare: 0 };
    return {
      memberId: member.id,
      member,
      totalPaid: Math.round(data.totalPaid * 100) / 100,
      totalShare: Math.round(data.totalShare * 100) / 100,
      netBalance: Math.round((data.totalPaid - data.totalShare) * 100) / 100,
    };
  });
}

/**
 * Greedy algorithm to find minimum number of transactions to settle all debts
 */
export function calculateSettlements(trip: Trip): SettlementTransaction[] {
  const balances = calculateBalances(trip);
  const memberMap = new Map(trip.members.map(m => [m.id, m]));

  // Debtors: netBalance < -0.01 (they owe money)
  const debtors: { memberId: string; amount: number }[] = [];
  // Creditors: netBalance > 0.01 (they are owed money)
  const creditors: { memberId: string; amount: number }[] = [];

  for (const b of balances) {
    if (b.netBalance < -0.01) {
      debtors.push({ memberId: b.memberId, amount: Math.abs(b.netBalance) });
    } else if (b.netBalance > 0.01) {
      creditors.push({ memberId: b.memberId, amount: b.netBalance });
    }
  }

  const transactions: SettlementTransaction[] = [];
  let txIndex = 1;

  // Sort descending by amount to minimize total transactions
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    // Settle the minimum of what debtor owes and what creditor is owed
    const transferAmount = Math.min(debtor.amount, creditor.amount);

    if (transferAmount > 0.01) {
      const fromMem = memberMap.get(debtor.memberId)!;
      const toMem = memberMap.get(creditor.memberId)!;

      transactions.push({
        id: `tx-${txIndex++}`,
        fromMemberId: debtor.memberId,
        toMemberId: creditor.memberId,
        fromMember: fromMem,
        toMember: toMem,
        amount: Math.round(transferAmount * 100) / 100,
      });

      debtor.amount -= transferAmount;
      creditor.amount -= transferAmount;
    }

    if (debtor.amount <= 0.01) {
      dIdx++;
    }
    if (creditor.amount <= 0.01) {
      cIdx++;
    }
  }

  return transactions;
}

/**
 * Formats a clean, readable text message ready for LINE group chat
 */
export function formatLineSummary(trip: Trip): string {
  const totalAmount = trip.expenses.reduce((sum, e) => sum + e.amount, 0);
  const avgPerPerson = trip.members.length > 0 ? totalAmount / trip.members.length : 0;
  const settlements = calculateSettlements(trip);
  const balances = calculateBalances(trip);

  let text = `🎉 สรุปเคลียร์บิล: ${trip.title}\n`;
  if (trip.dates) text += `📅 ช่วงเวลา: ${trip.dates}\n`;
  text += `💰 ยอดรวมทั้งทริป: ${totalAmount.toLocaleString('th-TH')} ${trip.currency} (${trip.members.length} คน, ${trip.expenses.length} รายการ)\n`;
  text += `👥 ค่าเฉลี่ยต่อคน: ~${Math.round(avgPerPerson).toLocaleString('th-TH')} ${trip.currency}\n`;
  text += `=========================\n`;
  text += `📌 รายการโอนเงินเคลียร์หนี้สุทธิ:\n`;

  if (settlements.length === 0) {
    text += `✨ ไม่มีหนี้ค้าง! ทุกคนเคลียร์เงินครบถ้วนแล้ว\n`;
  } else {
    settlements.forEach((tx, idx) => {
      text += `${idx + 1}. ${tx.fromMember.name} ➡️ โอนให้ ${tx.toMember.name} : ${tx.amount.toLocaleString('th-TH')} ${trip.currency}\n`;
      if (tx.toMember.promptpay) {
        text += `   📱 พร้อมเพย์: ${tx.toMember.promptpay} (${tx.toMember.name})\n`;
      }
      if (tx.toMember.bankAccount && tx.toMember.bankName) {
        text += `   🏦 บัญชี: ${tx.toMember.bankAccount} (${tx.toMember.bankName})\n`;
      }
    });
  }

  text += `=========================\n`;
  text += `📊 สรุปยอดรายคน:\n`;
  balances.forEach(b => {
    const sign = b.netBalance >= 0 ? '+' : '';
    const statusText = b.netBalance > 0.01 
      ? `(ได้รับคืน ${b.netBalance.toLocaleString('th-TH')} ${trip.currency})` 
      : b.netBalance < -0.01 
        ? `(ต้องจ่ายเพิ่ม ${Math.abs(b.netBalance).toLocaleString('th-TH')} ${trip.currency})`
        : `(เคลียร์แล้ว 0 ${trip.currency})`;

    text += `• ${b.member.name}: จ่ายไป ${b.totalPaid.toLocaleString('th-TH')} บ. | รับผิดชอบ ${b.totalShare.toLocaleString('th-TH')} บ. ➡️ ${sign}${b.netBalance.toLocaleString('th-TH')} บ. ${statusText}\n`;
  });

  text += `=========================\n`;
  text += `✨ คำนวณด้วย TripSplit (GitLab Ready)`;

  return text;
}

export function getCategoryMeta(category: ExpenseCategory): {
  label: string;
  iconName: string;
  colorClass: string;
  bgClass: string;
} {
  switch (category) {
    case 'stay':
      return { label: 'ที่พัก', iconName: 'Home', colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50 border-indigo-200' };
    case 'food':
      return { label: 'อาหาร & ดื่ม', iconName: 'Utensils', colorClass: 'text-amber-600', bgClass: 'bg-amber-50 border-amber-200' };
    case 'transport':
      return { label: 'เดินทาง & น้ำมัน', iconName: 'Car', colorClass: 'text-blue-600', bgClass: 'bg-blue-50 border-blue-200' };
    case 'cafe':
      return { label: 'คาเฟ่ & ของหวาน', iconName: 'Coffee', colorClass: 'text-rose-600', bgClass: 'bg-rose-50 border-rose-200' };
    case 'activity':
      return { label: 'กิจกรรม & ตั๋ว', iconName: 'Ticket', colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50 border-emerald-200' };
    case 'shopping':
      return { label: 'ของฝาก & ช้อปปิ้ง', iconName: 'ShoppingBag', colorClass: 'text-purple-600', bgClass: 'bg-purple-50 border-purple-200' };
    default:
      return { label: 'อื่นๆ', iconName: 'Receipt', colorClass: 'text-slate-600', bgClass: 'bg-slate-50 border-slate-200' };
  }
}
