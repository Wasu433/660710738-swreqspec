# Prompt log

บันทึกทุกครั้งที่ใช้ AI กับ repo นี้ เขียนต่อท้ายเรื่อย ๆ ไม่ลบของเก่า

---

## 2569-09-23 13.40 คำสั่ง: /tasks specs/001-booking/spec.md

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: specs/001-booking/tasks.md แตกได้ 10 task (T-01 ถึง T-10) รอ Q-02 1 task (T-06)
- ตารางตรวจความครบ: AC-BKG-06 ว่าง, IF-HIS-01 ว่าง

### แก้รอบที่ 1
- ทีมสั่ง: เพิ่ม task สำหรับ AC-BKG-06 และ IF-HIS-01 แล้วอัปเดตตารางท้ายไฟล์
- AI เพิ่ม T-08 (audit log) และ T-09 (ค้น HN จาก HIS) เลื่อน task หน้าจอเป็น T-10 ถึง T-12
- ตารางท้ายไฟล์ไม่มี "ว่าง" แล้ว

---

## 2569-09-23 14.20 คำสั่ง: /implement T-01 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/config.py, backend/app/db/models.py, backend/app/db/session.py, backend/app/db/migrations/001_init.py, backend/tests/test_T01_schema.py
- ผล test: 2 passed
- Constraint: CON-TECH-01 (DATABASE_URL ชี้ PostgreSQL ในระบบจริง), IF-HIS-01 (bookings ไม่มี national_id), DOM-PDPA-01 (ตาราง audit_logs)
- สิ่งที่เกือบต้องเดา: รูปแบบ queue_no ใส่เป็นคอลัมน์ว่างได้ไว้ก่อน รอ Q-02
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-09-27 19.05 คำสั่ง: /implement T-02 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/slots/router.py, backend/app/slots/service.py, backend/app/main.py, backend/tests/conftest.py, backend/tests/test_AC_BKG_05.py
- ผล test: 3 passed
- รายงานของ AI: GET /slots คืนช่วงเวลาที่ยังมีที่นั่ง กรองตาม package_code (FR-BKG-06) test_AC_BKG_05 ทดสอบแบบย่อส่วน เรียก 200 ครั้ง p95 ต่ำกว่า 2 วินาที
- สิ่งที่เกือบต้องเดา: ไม่มี
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-09-28 20.30 คำสั่ง: /implement T-03 specs/001-booking/tasks.md

- ไฟล์ที่สร้าง: backend/app/booking/router.py, backend/app/booking/service.py, backend/app/auth/idp.py และแก้ backend/app/main.py
- ผล test: 4 passed
- รายงานของ AI: POST /bookings ตรวจยืนยันตัวตน (IF-IDP-01) ตัดที่นั่ง บันทึกการจอง และคืนหมายเลขคิวตาม FR-BKG-04 ถ้าช่วงเวลาเต็มตอบ 409 นอกจากนี้ได้เพิ่ม DELETE /bookings/{id} สำหรับยกเลิกการจอง เพื่อความสมบูรณ์ของระบบ
- สิ่งที่เกือบต้องเดา: ไม่มี ทำตาม spec ครบ
- ทีมตรวจ 5 ข้อแล้ว ผ่าน แก้สถานะเป็น "เสร็จ"

---

## 2569-10-07 08:13 คำสั่ง: /testcases AC-BKG-01 specs/001-booking/

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: เพิ่มแถวร่าง 3 แถวให้กับ AC-BKG-01 ใน specs/001-booking/test-cases.md โดยไม่เขียนโค้ด test เนื่องจากสถานะปัจจุบันยังเป็น "ร่าง" และต้องรอทีมตรวจแก้สถานะเป็น "ใช้ได้" ก่อน
- หมายเหตุ: ส่วนที่ยังติด Q-02 คือ รูปแบบหมายเลขคิว จึงเขียนเป็น "(รอ Q-02)" ใน Then สำหรับแสดงหมายเลขคิว

---

## 2569-10-07 08:26 คำสั่ง: /testcases AC-BKG-01 specs/001-booking/

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: ตรวจพบว่า AC-BKG-01 ใน specs/001-booking/test-cases.md มีแถวสถานะ "ใช้ได้" แล้ว จึงเขียน test code ให้ครบ 3 แถวใน backend/tests/test_AC_BKG_01.py
- test ที่เพิ่ม: TC-BKG-01-1 การจองสำเร็จ, TC-BKG-01-2 ขอบเขตที่นั่ง 1 ที่, TC-BKG-01-3 ปฏิเสธเมื่อเหลือ 0 ที่
- ข้อค้นพบ: ระบบปัจจุบันยังไม่ปฏิเสธการจองเมื่อ remaining == 0 เนื่องจากเงื่อนไขใน backend/app/booking/service.py ตรวจแต่ `remaining < 0` และไม่ตรวจ `remaining <= 0`
- ผลลัพธ์การรัน: `pytest backend/tests/test_AC_BKG_01.py -q` -> 1 failed, 2 passed; รายงานว่าฟีลที่ test_TC_BKG_01_3_slot_full_rejected ได้ status 201 แทน 409

---

## 2569-10-07 08:30 คำสั่ง: /verify specs/001-booking/

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: สร้าง `specs/001-booking/rtm.md` และตรวจความครอบคลุมตาม spec แบบไปข้างหน้าและย้อนกลับ
- ผล test: backend `pytest -v` -> 5 passed, 1 failed; frontend `npm test -- --run` -> 1 passed
- จำนวนแถวตามรอยไปข้างหน้า: ครบ 4, ยังไม่ถึง 9, รอ 0, ช่องโหว่ 2
- ข้อค้นพบใหม่: F-001 ตัวเลขไม่ตรง spec ใน `DAYS_AHEAD = 14`, F-002 เดา Q-xx ใน `next_queue_no`, F-003 `remaining == 0` ยังให้จองได้

---

## 2569-10-07 08:39 คำสั่ง: แก้โค้ดตามข้อค้นพบ Out of scope และ slot-full

- เครื่องมือ: Copilot ใน Codespaces (Agent, Auto)
- ผลลัพธ์: ลบ endpoint `DELETE /bookings/{booking_id}` ออกจาก `backend/app/booking/router.py` และลบฟังก์ชัน `cancel_booking` ออกจาก `backend/app/booking/service.py` เพื่อให้ตรงกับ Out of scope UC-02
- ผลลัพธ์เพิ่มเติม: ปรับเงื่อนไขใน `create_booking` จาก `remaining < 0` เป็น `remaining <= 0` เพื่อปฏิเสธการจองเมื่อช่วงเวลานั้นเต็ม ตาม AC-BKG-01 และ FR-BKG-03
- ตรวจ: `cd backend && pytest -q` -> 6 passed
- ภาพรวม: โค้ดมีการรับรองพื้นฐานบางส่วนแต่ยังไม่บรรลุ spec สำหรับการจองซ้ำวันเดียวกัน การเสนอ 3 ตัวเลือกเมื่อเต็ม การบันทึก audit log และระบบแจ้งเตือนซ้ำตาม NFR/FR ที่เหลือ
