# Tasks: จองคิวตรวจสุขภาพ (Booking)

- Feature: จองคิวตรวจสุขภาพ
- Spec ID: SPEC-BKG-001
- อ้างอิง: `specs/001-booking/plan.md` (plan v1)
- วันที่: 2569-09-23
- สรุป: มีทั้งหมด 20 tasks และครอบคลุมงานข้อมูล, API, หน้าจอ และการทดสอบตามลำดับการพึ่งพา
- มี 3 tasks ที่ต้องรอ Open Question Q-02 ก่อนจึงจะทำให้เสร็จสมบูรณ์

## รายการงาน

### T-01 สร้างตารางและ migration
- รองรับ: CON-TECH-01, DOM-PDPA-01, IF-HIS-01, FR-BKG-02, FR-BKG-04
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05, T-06 และ T-09
- ไฟล์ที่แตะ: `backend/app/db/models.py`, `backend/app/db/session.py`, `backend/app/db/migrations/001_init.py`, `backend/tests/conftest.py`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: migration สร้างตาราง `slots`, `bookings` และ `audit_logs` ได้ และ `bookings` ไม่มีคอลัมน์เลขบัตรประชาชน
- สถานะ: เสร็จ รอทีมตรวจ

### T-02 ตรวจผลยืนยันตัวตนก่อนเข้า endpoint
- รองรับ: IF-IDP-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-03, T-05, T-06, T-07, T-08 และ T-10
- ไฟล์ที่แตะ: `backend/app/auth/idp.py`, `backend/app/main.py`, `backend/tests/test_auth.py`
- ต้องทำหลัง: T-01
- เสร็จเมื่อ: endpoint ที่แตะข้อมูลผู้รับบริการปฏิเสธคำขอที่ไม่มีผลยืนยันตัวตน และยอมรับคำขอที่ยืนยันแล้ว
- สถานะ: พร้อมทำ

### T-03 สร้าง API ค้นหาช่วงเวลาว่าง
- รองรับ: FR-BKG-01, FR-BKG-06, ASM-01, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-04, T-12 และ T-15
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/slots/router.py`, `backend/app/main.py`, `backend/tests/test_slots.py`
- ต้องทำหลัง: T-01, T-02
- เสร็จเมื่อ: `GET /slots` คืนช่วงเวลาภายใน 30 วันพร้อม `remaining` และโหลดผลใหม่เมื่อ `package_code` เปลี่ยน
- สถานะ: พร้อมทำ

### T-04 วัดประสิทธิภาพการค้นหาช่วงเวลา
- รองรับ: NFR-PERF-01, FR-BKG-01
- ตรวจด้วย: AC-BKG-05
- ไฟล์ที่แตะ: `backend/tests/test_AC_BKG_05.py`
- ต้องทำหลัง: T-03
- เสร็จเมื่อ: การทดสอบคำขอพร้อมกัน 200 รายการรายงานค่า p95 ไม่เกิน 2 วินาที หรือบันทึกผลการวัดบนเครื่องทดสอบตามข้อจำกัดของสภาพแวดล้อม
- สถานะ: พร้อมทำ

### T-05 บันทึกการจองและตัดที่นั่ง
- รองรับ: FR-BKG-04, ASM-02
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-09 และ T-14
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_booking_create.py`
- ต้องทำหลัง: T-01, T-02, T-03
- เสร็จเมื่อ: `POST /bookings` บันทึก booking และลด `remaining` ใน transaction เดียวกันเมื่อมีที่นั่ง
- สถานะ: พร้อมทำ

### T-06 ป้องกันการจองซ้ำในวันเดียวกัน
- รองรับ: FR-BKG-02, ASM-02, ASM-04
- ตรวจด้วย: AC-BKG-02
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/tests/test_AC_BKG_02.py`
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: การจองวันที่มีคิวที่ยังไม่ได้ใช้ถูกปฏิเสธและ response แสดงหมายเลขคิวเดิมตามข้อมูลที่มี
- สถานะ: รอ Q-02

### T-07 เสนอช่วงเวลาใกล้เคียงเมื่อเต็ม
- รองรับ: FR-BKG-03, ASM-02
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `backend/app/slots/service.py`, `backend/app/booking/service.py`, `backend/app/booking/router.py`, `backend/tests/test_AC_BKG_03.py`
- ต้องทำหลัง: T-03, T-05
- เสร็จเมื่อ: การยืนยันช่วงเวลาที่เต็มคืน 409 พร้อม 3 ช่วงที่ใกล้ที่สุดในวันเดียวกันและวันถัดไป และไม่มี booking ใหม่
- สถานะ: พร้อมทำ

### T-08 สร้างคิวส่งข้อความและส่งซ้ำ
- รองรับ: FR-BKG-05, IF-NOT-01, NFR-REL-02, ASM-03
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `backend/app/notify/queue.py`, `backend/app/booking/service.py`, `backend/tests/test_AC_BKG_04.py`
- ต้องทำหลัง: T-05
- เสร็จเมื่อ: การจองยังบันทึกและแสดงผลได้เมื่อผู้ให้บริการแจ้งเตือนไม่ตอบสนอง พร้อมมีงานส่งซ้ำภายใน 5 นาทีตาม ASM-03
- สถานะ: พร้อมทำ

### T-09 บันทึก audit log การเข้าถึง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: `backend/app/audit/middleware.py`, `backend/app/main.py`, `backend/tests/test_AC_BKG_06.py`
- ต้องทำหลัง: T-01, T-02, T-05
- เสร็จเมื่อ: การเปิดดูข้อมูลการจองสร้าง audit log ที่มีผู้เข้าถึง เวลา และ HN และเก็บข้อมูลได้ไม่น้อยกว่า 1 ปีตามการตั้งค่า
- สถานะ: พร้อมทำ

### T-10 สร้างการค้นหา HN จาก HIS
- รองรับ: IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-05
- ไฟล์ที่แตะ: `backend/app/his/client.py`, `backend/app/booking/router.py`, `backend/app/main.py`, `backend/tests/test_his_lookup.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: `GET /patients/lookup` ส่งเลขบัตรไปค้น HIS แล้วคืน HN และข้อมูล booking ไม่เก็บเลขบัตรประชาชน
- สถานะ: พร้อมทำ

### T-11 บังคับใช้ TLS สำหรับการรับส่งข้อมูล
- รองรับ: NFR-SEC-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของการเปิดใช้งานระบบ
- ไฟล์ที่แตะ: `backend/app/config.py`, `backend/app/main.py`, `frontend/vite.config.js`, `backend/tests/test_security_config.py`
- ต้องทำหลัง: T-02
- เสร็จเมื่อ: configuration และการทดสอบยืนยันว่าช่องทางรับส่งข้อมูลกำหนด TLS ตั้งแต่ 1.2 ขึ้นไป
- สถานะ: พร้อมทำ

### T-12 สร้างหน้าจอเลือกแพ็กเกจและช่วงเวลา
- รองรับ: FR-BKG-01, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-13 และ T-15
- ไฟล์ที่แตะ: `frontend/src/pages/SlotPicker.jsx`, `frontend/src/App.jsx`, `frontend/src/api/client.js`, `frontend/src/__tests__/SlotPicker.test.jsx`
- ต้องทำหลัง: ไม่มี
- เสร็จเมื่อ: หน้าจอแสดงวัน/ช่วงเวลา/ที่นั่งคงเหลือจาก API จำลอง และโหลดรายการใหม่เมื่อเปลี่ยนแพ็กเกจ
- สถานะ: พร้อมทำ

### T-13 สร้างหน้ายืนยันและทางเลือกเมื่อช่วงเวลาเต็ม
- รองรับ: FR-BKG-03, FR-BKG-04
- ตรวจด้วย: AC-BKG-03
- ไฟล์ที่แตะ: `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/AC-BKG-03.test.jsx`
- ต้องทำหลัง: T-12
- เสร็จเมื่อ: API จำลองตอบ 409 แล้วหน้าจอแสดงข้อความ "ช่วงเวลาเต็ม" และตัวเลือกที่ว่าง 3 รายการ
- สถานะ: พร้อมทำ

### T-14 สร้างหน้าผลการจองและสถานะส่งข้อความ
- รองรับ: FR-BKG-04, FR-BKG-05, IF-NOT-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานพื้นฐานของ T-17
- ไฟล์ที่แตะ: `frontend/src/pages/BookingResult.jsx`, `frontend/src/App.jsx`, `frontend/src/__tests__/BookingResult.test.jsx`
- ต้องทำหลัง: T-08, T-12
- เสร็จเมื่อ: หน้าจอแสดงผลการจองและรองรับสถานะส่งข้อความไม่สำเร็จโดยไม่ซ่อนผลการจอง
- สถานะ: พร้อมทำ

### T-15 ต่อหน้าจอเลือกเวลาและยืนยันกับ API จริง
- รองรับ: FR-BKG-01, FR-BKG-03, FR-BKG-04, FR-BKG-06
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงาน integration ของ T-03, T-07 และ T-13
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/SlotPicker.jsx`, `frontend/src/pages/ConfirmBooking.jsx`, `frontend/src/App.jsx`
- ต้องทำหลัง: T-03, T-07, T-12, T-13
- เสร็จเมื่อ: flow จากเลือกแพ็กเกจ/เวลาไปถึงการยืนยันเรียก API จริงผ่าน `/api` และรองรับ response สำเร็จ/409 ตามสัญญา
- สถานะ: พร้อมทำ

### T-16 ทดสอบเวลาการจองของผู้ใช้ใหม่
- รองรับ: NFR-USE-01, ASM-05
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานตรวจคุณภาพการใช้งาน
- ไฟล์ที่แตะ: `frontend/src/__tests__/usability-NFR-USE-01.test.jsx`, `docs/srs/README.md`
- ต้องทำหลัง: T-15
- เสร็จเมื่อ: ผู้ทดสอบใหม่ 10 คนทำ flow จองจนเห็นผลสำเร็จ และมีอย่างน้อย 8 คนเสร็จภายใน 3 นาทีโดยไม่ขอความช่วยเหลือ
- สถานะ: พร้อมทำ

### T-17 กำหนดเลขคิวและการแสดงเลขคิว
- รองรับ: FR-BKG-04, FR-BKG-05, AC-BKG-01
- ตรวจด้วย: AC-BKG-01
- ไฟล์ที่แตะ: `backend/app/booking/service.py`, `backend/app/booking/router.py`, `frontend/src/pages/BookingResult.jsx`, `backend/tests/test_AC_BKG_01.py`, `frontend/src/__tests__/AC-BKG-01.test.jsx`
- ต้องทำหลัง: T-05, T-14
- เสร็จเมื่อ: มีวิธีออกเลขคิวและหน้าจอแสดงเลขคิวที่ผ่าน AC-BKG-01 ตามคำตอบของ Q-02
- สถานะ: รอ Q-02

### T-18 ต่อผลการจองกับการทดสอบหน้าจอครบ flow
- รองรับ: FR-BKG-04, FR-BKG-05
- ตรวจด้วย: AC-BKG-04
- ไฟล์ที่แตะ: `frontend/src/api/client.js`, `frontend/src/pages/BookingResult.jsx`, `frontend/src/__tests__/AC-BKG-04.test.jsx`
- ต้องทำหลัง: T-08, T-14, T-17
- เสร็จเมื่อ: API จำลองจำลองการแจ้งเตือนไม่ตอบสนองแล้วหน้าจอยังแสดงหมายเลขคิวและสถานะงานส่งซ้ำได้ตาม AC-BKG-04
- สถานะ: รอ Q-02

### T-19 ทดสอบ audit log การเข้าถึงข้อมูลการจอง
- รองรับ: DOM-PDPA-01
- ตรวจด้วย: AC-BKG-06
- ไฟล์ที่แตะ: `backend/tests/test_AC_BKG_06.py`
- ต้องทำหลัง: T-09
- เสร็จเมื่อ: test_AC_BKG_06 ผ่านและตรวจพบผู้เข้าถึง เวลา และรหัสผู้รับบริการใน audit log
- สถานะ: พร้อมทำ

### T-20 ทดสอบการค้นหา HN จาก HIS
- รองรับ: IF-HIS-01
- ตรวจด้วย: ไม่มี AC ตรง ๆ เป็นงานตรวจการเชื่อมต่อ HIS และการไม่เก็บเลขบัตรประชาชน
- ไฟล์ที่แตะ: `backend/tests/test_IF_HIS_01.py`
- ต้องทำหลัง: T-10
- เสร็จเมื่อ: การทดสอบยืนยันว่าระบบส่งเลขบัตรไปยัง HIS คืน HN และไม่บันทึกเลขบัตรประชาชนใน booking
- สถานะ: พร้อมทำ

## ตารางตรวจความครบของ Acceptance Criteria

| AC ID | task ที่ตรวจ AC นี้ |
|---|---|
| AC-BKG-01 | T-17 |
| AC-BKG-02 | T-06 |
| AC-BKG-03 | T-07, T-13 |
| AC-BKG-04 | T-08, T-18 |
| AC-BKG-05 | T-04 |
| AC-BKG-06 | T-09, T-19 |

## ตารางตรวจความครบของ Constraints

| Constraint ID | task ที่ทำให้เป็นจริง |
|---|---|
| CON-TECH-01 | T-01 |
| DOM-PDPA-01 | T-01, T-09 |
| IF-IDP-01 | T-02 |
| IF-HIS-01 | T-01, T-10, T-20 |
| IF-NOT-01 | T-08, T-14 |

## สิ่งที่ยังไม่ทำ

- Q-02: หมายเลขคิวรีเซ็ตรายวันหรือนับต่อเนื่อง และมีรูปแบบอย่างไร เช่น `A001` ถามเจ้าหน้าที่เวชระเบียน
- งานที่รอ Q-02: T-06, T-17 และ T-18
- จะยังไม่กำหนดวิธีออกเลขคิวหรือรูปแบบเลขคิวแทนทีมจนกว่าจะได้รับคำตอบ Q-02