# TripSplit - เว็บหารค่าใช้จ่ายทริปเพื่อน & เคลียร์บิลสุทธิ (GitLab Ready)

เว็บแอปพลิเคชันคำนวณและหารค่าใช้จ่ายทริปสำหรับกลุ่มเพื่อน รองรับการบันทึกว่าใครเป็นคนจ่ายเงินสำรอง หารเท่ากันทุกคน เลือกรายคนที่หาร หรือระบุจำนวนเงินเฉพาะคน พร้อมระบบคำนวณตัดหนี้สุทธิ (Debt Simplification) บอกชัดเจนว่า "ใครต้องโอนให้ใคร เท่าไหร่" และปุ่มคัดลอกข้อความสรุปพร้อมส่งเข้าห้องแชต LINE ได้ทันที พร้อมไฟล์ CI/CD สำหรับนำไปรันบน GitLab Pages

## User Review & Critical Decisions

> [!IMPORTANT]
> สรุปข้อตกลงและฟังก์ชันสำคัญที่ได้รับการยืนยันจากผู้ใช้:

- **Confirmed Decision 1 (รูปแบบการหารค่าใช้จ่าย)**: รองรับครบทั้ง 3 โหมดในแต่ละบิล:
  1. *หารเท่ากันทุกคนในทริป* (Split equally among all)
  2. *เลือกรายชื่อเพื่อนที่หาร* (Split equally among selected participants)
  3. *ระบุจำนวนเงินที่แต่ละคนต้องจ่าย* (Exact custom amounts per person)
- **Confirmed Decision 2 (การสรุปยอดเคลียร์เงิน)**: แสดงยอดสุทธิรายคน (Net Balance) พร้อมคำนวณจับคู่เส้นทางการโอนที่สั้นที่สุด (Who pays whom) และปุ่มกดครั้งเดียวคัดลอกข้อความสรุปจัดรูปแบบสวยงามส่งเข้ากลุ่ม LINE
- **Confirmed Decision 3 (ข้อมูล Mockup เริ่มต้น)**: ติดตั้งข้อมูลตัวอย่างเริ่มต้นเป็น "ทริปเชียงใหม่-ม่อนแจ่ม 3 วัน 2 คืน" สมาชิก 5 คน พร้อมค่าใช้จ่ายจริงหลากหลายหมวดหมู่ (ค่าที่พัก, ค่าน้ำมัน, ชาบู, คาเฟ่, กิจกรรม) พร้อมปุ่ม Reset/Reload ข้อมูล Mockup ได้ตลอดเวลา
- **GitLab Compatibility**: สร้างไฟล์ `.gitlab-ci.yml` สำหรับ GitLab Pages (CI/CD pipeline) ให้สามารถ push โค้ดขึ้น GitLab repository แล้ว deploy เว็บไซต์ขึ้น GitLab Pages อัตโนมัติ

---

## 1. Overview & Core Concept

- **What It Does**: จัดการค่าใช้จ่ายในทริปท่องเที่ยวแบบกลุ่ม ไม่ว่าใครจะเป็นคนสำรองจ่ายค่าอะไร ระบบจะรวบรวม คิดคำนวณสัดส่วน และคำนวณยอดชำระคืนสุทธิ เพื่อให้ทุกคนเคลียร์เงินกันได้ง่ายที่สุด ไม่ต้องปวดหัวกับการโอนเงินวนไปมา
- **Target Audience**: กลุ่มเพื่อน, ครอบครัว, หรือเพื่อนร่วมงานที่ไปเที่ยว กินข้าว หรือทำกิจกรรมร่วมกัน
- **Key Value**: 
  - ลดขั้นตอนการคำนวณที่ซับซ้อนให้เหลือเพียง 1 คลิก
  - ประหยัดจำนวนครั้งในการโอนเงินด้วยอัลกอริทึมเคลียร์หนี้สุทธิ (Min-Cash Flow)
  - พกพาสะดวก ใช้งานบนมือถือหรือคอมพิวเตอร์ได้ลื่นไหล ไม่ต้องโหลดแอป ไม่ต้องสมัครสมาชิก (Client-side Data Persistence)

---

## 2. User Experience & Visual Design

### Key User Flows
1. **หน้าสรุปภาพรวม (Overview & Summary)**:
   - บัตรสรุปยอดรวมทั้งทริป (Total Spent), ค่าใช้จ่ายเฉลี่ยต่อคน (Average per person), และจำนวนรายการทั้งหมด
   - ส่วน **"ใครต้องโอนให้ใคร" (Settlement Plan)**: การ์ดแสดงรายการโอนเงินสุทธิ เช่น `มายด์ ➡️ โอนให้ แบงค์ 1,420 บาท` พร้อมปุ่ม "คัดลอกสรุปส่ง LINE"
   - ตารางสถานะรายบุคคล: แสดงยอดเงินที่แต่ละคนจ่ายไป (Paid), ยอดที่ต้องรับผิดชอบ (Share), และสถานะสุทธิ (+ได้รับเงินคืน / -ต้องจ่ายเพิ่ม)
2. **หน้าบันทึกค่าใช้จ่าย (Expense Management)**:
   - ฟอร์มเพิ่ม/แก้ไขค่าใช้จ่าย:
     - ชื่อรายการ (เช่น ค่าชาบูมื้อเย็น, ค่าที่พักพูลวิลล่า)
     - จำนวนเงิน (บาท)
     - หมวดหมู่ (อาหาร, ที่พัก, เดินทาง/น้ำมัน, คาเฟ่/ของหวาน, กิจกรรม, อื่นๆ)
     - ผู้จ่ายเงิน (Payer selector)
     - โหมดการหาร (ทุกคน / ติ๊กเลือกเฉพาะคน / กรอกยอดเงินรายคน)
   - รายการประวัติค่าใช้จ่าย พร้อมตัวกรองตามหมวดหมู่หรือค้นหาตามชื่อ
3. **การจัดการสมาชิก (Trip Members)**:
   - เพิ่ม/ลบรายชื่อเพื่อนในทริป
   - แสดงสี Avatar ประจำตัวที่อ่านง่ายและแยกแยะได้ชัดเจน
4. **GitLab Deployment Guide Modal**:
   - ป๊อปอัปแนะนำวิธีนำโค้ดไปขึ้น GitLab Pages พร้อมไฟล์ `.gitlab-ci.yml` สำเร็จรูป

### Visual Identity & Theme
- **Aesthetic Direction**: Financial utility ที่ทันสมัย สะอาด สบายตา สไตล์ Modern SaaS (Slate & Emerald accents)
- **Color Palette**:
  - Background Neutral: Light slate / Crisp clean white (`bg-slate-50`, `bg-white`) พร้อมรองรับ Dark Mode (`dark:bg-slate-950`)
  - Accent / Positive (ได้รับคืน): Emerald (`text-emerald-600`, `bg-emerald-500`)
  - Negative (ต้องจ่ายเพิ่ม): Rose/Coral (`text-rose-600`, `bg-rose-500`)
  - Primary Action: Deep Indigo / Slate (`bg-slate-900 hover:bg-slate-800 text-white`)
- **Typography & Formatting**:
  - ฟอนต์หลัก: `Plus Jakarta Sans` / `Noto Sans Thai` สำหรับข้อความทั่วไป
  - ตัวเลขและการเงิน: บังคับใช้ `tabular-nums` และ `font-mono` สำหรับตัวเลขเงินและยอดรวมเพื่อความแม่นยำในการอ่าน

---

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Zero-backend / Client-Side Persistence with LocalStorage**
  - *Chosen Approach*: บันทึกข้อมูลทริปและรายการค่าใช้จ่ายลงใน `localStorage` ของเบราว์เซอร์ พร้อมระบบ Export/Import JSON
  - *Why*: ทำให้สามารถ deploy บน **GitLab Pages** (Static hosting ฟรี 100%) ได้ทันทีโดยไม่ต้องตั้งค่า Server หรือ Database เพิ่มเติม ปลอดภัย รวดเร็ว และทำงานแบบออฟไลน์ได้
- **Decision 2: Optimal Settlement Algorithm (Greedy Debt Simplification)**
  - *Chosen Approach*: ใช้อัลกอริทึมจัดกลุ่มคนที่เป็นเจ้าหนี้ (Net > 0) และลูกหนี้ (Net < 0) แล้วจับคู่ชำระเงินทีละคู่จนยอดดุลเป็นศูนย์
  - *Why*: ลดจำนวนธุรกรรมการโอนเงินให้น้อยที่สุด (เช่น จากเดิมที่ 5 คนอาจต้องโอน 10 ครั้ง ลดเหลือเพียง 3-4 ครั้ง)
- **Decision 3: Dedicated LINE Share Formatter**
  - *Chosen Approach*: ฟังก์ชันสร้างข้อความ Unicode ที่จัดช่องไฟและอิโมจิไว้อย่างสวยงาม พร้อมปุ่มคลิกคัดลอก (Copy to Clipboard)
  - *Why*: พฤติกรรมคนไทยเมื่อจบทริปจะส่งข้อความสรุปเข้ากลุ่ม LINE การมีปุ่มกดคัดลอกข้อความสำเร็จรูปช่วยลดความยุ่งยากในการพิมพ์เอง

---

## 4. Technical Architecture & Data Strategy

### System Architecture & Component Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                       TripSplit App                          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ Navigation Header: Trip Title, Currency, Tab Switcher  │  │
│  └────────────────────────────────────────────────────────┘  │
│                                │                             │
│        ┌───────────────────────┴───────────────────────┐     │
│        ▼                                               ▼     │
│  ┌─────────────────────────┐             ┌─────────────────┐ │
│  │   Overview & Summary    │             │   Expenses Tab  │ │
│  │ ─────────────────────── │             │ ─────────────── │ │
│  │ • Metric KPI Cards      │             │ • Add Expense   │ │
│  │ • Settlement List       │             │ • Expense List  │ │
│  │ • Member Balances       │             │ • Split Filter  │ │
│  │ • Copy to LINE Action   │             │ • Edit/Delete   │ │
│  └─────────────────────────┘             └─────────────────┘ │
│        │                                               │     │
│        └───────────────────────┬───────────────────────┘     │
│                                ▼                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │              Core Engine: Debt Simplification           │ │
│  │  - Net balance calculation (Paid - Share)               │ │
│  │  - Greedy settlement pairing (Debtor -> Creditor)       │ │
│  │  - Equal / Custom participant / Exact split calculators │ │
│  └─────────────────────────────────────────────────────────┘ │
│                                │                             │
│                                ▼                             │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │           LocalStorage & State Management               │ │
│  │  - Trips, Members, Expenses, Default Mockup Seeder      │ │
│  │  - Export / Import JSON & Reset capability              │ │
│  └─────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────┘
```

### Data Models

```typescript
export interface Member {
  id: string;
  name: string;
  avatarColor: string;
}

export type SplitType = 'equal_all' | 'equal_selected' | 'exact_amounts';

export interface ExpenseSplit {
  memberId: string;
  amount: number; // calculated or specified amount
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: 'food' | 'stay' | 'transport' | 'cafe' | 'activity' | 'other';
  date: string; // YYYY-MM-DD
  payerId: string; // Member who paid
  splitType: SplitType;
  participantIds: string[]; // For equal_selected or equal_all
  customAmounts?: Record<string, number>; // For exact_amounts { memberId: amount }
}

export interface Settlement {
  fromMemberId: string; // debtor
  toMemberId: string;   // creditor
  amount: number;
}
```

### GitLab Integration File (`.gitlab-ci.yml`)
- เพิ่มไฟล์ `.gitlab-ci.yml` ใน root repository เพื่อให้ผู้ใช้นำไปใช้งานบน GitLab Pages ได้ทันที:
  - Docker Image: `node:20`
  - Cache: `node_modules/`
  - Script: `npm ci && npm run build`
  - Artifacts: ย้ายโฟลเดอร์ `dist` ไปที่ `public` สำหรับ GitLab Pages
