# RTM: จองคิวตรวจสุขภาพ (Booking)
อ้างอิง: spec.md SPEC-BKG-001 Draft v2 | tasks.md | test-cases.md
สร้างด้วย /verify เมื่อ 2569-10-07 08:30 | test: 6 ผ่าน 1 ไม่ผ่าน

## 1. ตามรอยไปข้างหน้า (requirement ไป โค้ด ไป test)
| ID | AC | task | โค้ด (ไฟล์: ฟังก์ชัน) | test (ผล) | สถานะ |
|---|---|---|---|---|---|
| FR-BKG-01 | AC-BKG-05 | T-02 | `backend/app/slots/service.py: list_available_slots`, `backend/app/slots/router.py: get_slots` | `backend/tests/test_AC_BKG_05.py::test_AC_BKG_05` (ผ่าน) | ช่องโหว่ |
| FR-BKG-02 | AC-BKG-02 | T-04 | ไม่มีฟังก์ชันตรวจคิวที่ยังไม่ได้ใช้ในวันเดียวกัน | ไม่มี | ยังไม่ถึง |
| FR-BKG-03 | AC-BKG-03 | T-05, T-11, T-12 | ไม่มีฟังก์ชันเสนอ 3 ช่วงว่างใกล้เคียง และไม่มีหน้าจอตรวจ | ไม่มี | ยังไม่ถึง |
| FR-BKG-04 | AC-BKG-01 | T-03, T-06 | `backend/app/booking/service.py: create_booking`, `next_queue_no`; `backend/app/booking/router.py: create_booking` | `backend/tests/test_AC_BKG_01.py` (2/3 ผ่าน, 1 ไม่ผ่าน) | ช่องโหว่ |
| FR-BKG-05 | AC-BKG-04 | T-07 | ไม่มีคิวส่งข้อความซ้ำ / queue retry | ไม่มี | ยังไม่ถึง |
| FR-BKG-06 | ไม่มี AC | T-10 | `backend/app/slots/service.py: list_available_slots` (กรองตาม `package_code`) | ไม่มี | ครบ |
| NFR-PERF-01 | AC-BKG-05 | T-02 | `backend/app/slots/service.py: list_available_slots` | `backend/tests/test_AC_BKG_05.py::test_AC_BKG_05` (ผ่าน) | ครบ |
| NFR-SEC-01 | ไม่มี AC | ไม่มี task | ไม่มี TLS/HTTPS config ในโค้ด | ไม่มี | ยังไม่ถึง |
| NFR-REL-02 | AC-BKG-04 | T-07 | ไม่มีคิวส่งซ้ำภายใน 5 นาที | ไม่มี | ยังไม่ถึง |
| NFR-USE-01 | ไม่มี AC | ไม่มี task | ไม่มีการทดสอบประสิทธิภาพการใช้งานตามผู้ใช้ใหม่ | ไม่มี | ยังไม่ถึง |
| CON-TECH-01 | ไม่มี AC | T-01 | `backend/app/config.py: DATABASE_URL`, `backend/app/db/session.py: get_db` | `backend/tests/test_T01_schema.py` (ผ่าน) | ครบ |
| DOM-PDPA-01 | AC-BKG-06 | T-08 | ไม่มี middleware/ฟังก์ชันบันทึก audit log ใน `backend/app/` | ไม่มี | ยังไม่ถึง |
| IF-IDP-01 | ไม่มี AC | T-03 | `backend/app/auth/idp.py: get_verified_hn` | booking tests เรียกผ่าน header `Authorization` และผ่าน | ครบ |
| IF-HIS-01 | ไม่มี AC | T-09 | `backend/app/db/models.py: Booking` ไม่มี `national_id`; ยังไม่มี client ค้น HN จาก HIS | `backend/tests/test_T01_schema.py::test_T01_no_national_id` (ผ่าน) | ยังไม่ถึง |
| IF-NOT-01 | ไม่มี AC | T-07 | ไม่มีไฟล์ `backend/app/notify/queue.py` และไม่มี async queue | ไม่มี | ยังไม่ถึง |

## 2. ตามรอยย้อนกลับ (โค้ด ไป requirement)
| โค้ด (ไฟล์: ฟังก์ชัน หรือ endpoint) | อ้าง ID | ตรงกับข้อความใน spec ไหม | หมายเหตุ |
|---|---|---|---|
| `backend/app/slots/router.py: GET /slots` | FR-BKG-01, FR-BKG-06 | ไม่ครบ | รายการช่วงว่างมีจริง แต่ `DAYS_AHEAD = 14` แทนที่จะเป็น 30 วันตาม spec; ส่วน package filter ทำงานได้ แต่ยังไม่มี UI ที่เปลี่ยนแพ็กเกจจริง |
| `backend/app/booking/router.py: POST /bookings` | FR-BKG-04 | ไม่ครบ | จองสำเร็จได้เมื่อ `remaining > 0` เท่านั้น แต่เงื่อนไข `remaining < 0` ทำให้ `remaining == 0` ยังยอมจองได้; ยังไม่มีการปฏิเสธการจองซ้ำวันเดียวกัน |
| `backend/app/booking/service.py: next_queue_no` | FR-BKG-04, Q-02 | ไม่ครบ | เลือกรูปแบบ `A001` และนับต่อวันแบบเดาเอง โดยไม่ได้รอคำตอบ Q-02 จากเจ้าหน้าที่เวชระเบียน |
| `backend/app/auth/idp.py: get_verified_hn` | IF-IDP-01 | ใช่ | ตรวจ `Authorization` header และคืน HN เมื่อ token เริ่มด้วยรูปแบบที่กำหนด; ไม่อนุญาตถ้ายังยืนยันตัวตนไม่สำเร็จ |
| `backend/app/db/models.py: Booking` | IF-HIS-01 | บางส่วน | ตารางไม่มี `national_id` ตามเงื่อนไข แต่ยังไม่มีการค้นหาจาก HIS และใช้ HN เท่านั้น |
| `frontend/src/App.jsx` | FR-BKG-03, FR-BKG-04, FR-BKG-05 | ไม่ครบ | โครงหน้าจอยังเป็น placeholder อย่างเดียว ไม่มีหน้าเลือกช่วงเวลาหรือยืนยันการจองจริง |

## 3. ข้อค้นพบ
ชนิด: AC ไม่มี test / test อ่อน / โค้ดไม่มี FR / FR ไม่มี AC / เดา Q-xx / ละเมิด Constraint / ตัวเลขไม่ตรง spec / อ้าง ID ผิดเรื่อง
ทีมตัดสิน: แก้โค้ด / แก้ spec / เพิ่ม Q-xx / ไม่ใช่ปัญหา (พร้อมเหตุผล 1 บรรทัด)

| F-ID | ชนิด | อยู่ที่ | ขัดกับ | รายละเอียด | ทีมตัดสิน |
|---|---|---|---|---|---|
| F-001 | ตัวเลขไม่ตรง spec | `backend/app/slots/service.py: DAYS_AHEAD = 14` | FR-BKG-01 | Spec ระบุแสดงช่วงเวลาว่างภายใน 30 วันข้างหน้า แต่โค้ดจำกัดที่ 14 วันเท่านั้น จึงไม่ตรงกับ Requirement ที่ระบุชัดเจน | แก้โค้ด |
| F-002 | เดา Q-xx | `backend/app/booking/service.py: next_queue_no` | FR-BKG-04, Q-02 | โค้ดกำหนดรูปแบบ `A001` และนับต่อวันแบบเดาเอง แม้ spec ระบุ Q-02 ยังไม่ได้คำตอบจากเจ้าหน้าที่เวชระเบียน | เพิ่ม Q-xx |
| F-003 | ตัวเลขไม่ตรง spec | `backend/app/booking/service.py: create_booking` | AC-BKG-01, FR-BKG-04 | เงื่อนไข `if slot.remaining < 0` ทำให้ `remaining == 0` ยังสามารถจองได้ จึงไม่ปฏิเสธเมื่อช่วงเต็มตาม AC-BKG-01 และ FR-BKG-03 | แก้โค้ด |

## 4. แก้แล้ว
| F-ID | แก้อย่างไร | รู้ได้อย่างไร |
|---|---|---|
| - | - | ยังไม่มีข้อค้นพบเดิมใน repo นี้ |
