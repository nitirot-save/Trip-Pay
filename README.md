# TripSplit - เว็บหารค่าใช้จ่ายทริปเพื่อน & เคลียร์บิลสุทธิ

เว็บแอปพลิเคชันสำหรับคำนวณและหารค่าใช้จ่ายทริปกลุ่มเพื่อน บันทึกผู้จ่ายเงิน รองรับทั้งหารเท่ากันทุกคน เลือกรายคน และระบุยอดรายคน พร้อมระบบเคลียร์หนี้สุทธิ (Debt Simplification) และปุ่มคัดลอกสรุปส่ง LINE ได้ทันที

รองรับการ Deploy ทั้งบน **GitHub Pages** และ **GitLab Pages** 100% ฟรี ไม่มีค่าใช้จ่าย และไม่ต้องมี Backend Server

---

## วิธีเชื่อมต่อและ Deploy บน GitHub (GitHub Pages)

### ขั้นตอนที่ 1: สร้าง Repository บน GitHub
1. เข้าไปที่ [GitHub.com](https://github.com) แล้วกด **New repository**
2. ตั้งชื่อ เช่น `tripsplit` และเลือกเป็น **Public**
3. กด **Create repository**

### ขั้นตอนที่ 2: Push โค้ดขึ้น GitHub
รันคำสั่งเหล่านี้ใน Terminal:
```bash
git init
git add .
git commit -m "feat: initial commit for TripSplit"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/tripsplit.git
git push -u origin main
```

### ขั้นตอนที่ 3: เปิดใช้งาน GitHub Pages
1. ในหน้า GitHub Repository ของคุณ ไปที่แท็บ **Settings** > **Pages**
2. ใต้หัวข้อ **Build and deployment** > **Source** ให้เลือกเป็น:
   👉 **GitHub Actions**
3. GitHub Actions จะรันไฟล์ `.github/workflows/deploy.yml` อัตโนมัติ และแสดง URL เว็บไซต์ เช่น:
   `https://<YOUR-USERNAME>.github.io/tripsplit/`

---

## วิธี Deploy บน GitLab (GitLab Pages)

1. สร้าง New Project บน [GitLab.com](https://gitlab.com)
2. Push โค้ดขึ้น GitLab:
```bash
git remote add origin https://gitlab.com/<YOUR-USERNAME>/tripsplit.git
git push -u origin main
```
3. GitLab CI/CD จะทำงานตามไฟล์ `.gitlab-ci.yml` อัตโนมัติ ดูเว็บไซต์ได้ที่เมนู **Deploy > Pages**

---

## พัฒนาต่อบนเครื่อง Local

```bash
# ติดตั้ง dependencies
npm install

# รันโหมด Development
npm run dev

# ทดสอบ Build
npm run build
```
