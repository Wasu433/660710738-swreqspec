# แผนทางเทคนิค: จองคิวตรวจสุขภาพ (Booking)

## 1. สรุปแนวทาง (5 บรรทัด)

ฟีเจอร์นี้ทำหน้าที่ให้ผู้รับบริการที่ยืนยันตัวตนแล้วเลือกแพ็กเกจ วัน และช่วงเวลาที่ตรวจสุขภาพ แล้วจองคิวได้ภายในวันเดียวกัน โดยผ่านกระบวนการตรวจสอบคิวที่ยังไม่ได้ใช้ ความพร้อมของช่วงเวลา และส่งข้อความยืนยันแบบ asynchronous สำหรับให้ผู้ใช้ได้รับคิวและแจ้งเตือนได้ทันที ระบบนี้จะใช้ MySQL สำหรับข้อมูลการจองและการคำนวณความพร้อม พร้อมทั้งบันทึก audit log ทุกครั้งที่เข้าถึงข้อมูลสุขภาพ เพื่อให้สอดคล้องกับข้อจำกัดด้านความปลอดภัยและความสามารถใช้งาน

## 2. เทคโนโลยีที่ใช้

| สิ่งที่เลือก | มาจาก | หมายเหตุ |
|---|---|---|
| MySQL | CON-TECH-01 | ใช้เป็นฐานข้อมูลหลักของการจองและความพร้อมของช่วงเวลา |
| React (Vite) | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เป็น frontend สำหรับแสดงวัน/ช่วงเวลา ทราบจำนวนที่นั่งคงเหลือ และหน้าจอยืนยันการจอง |
| Python FastAPI | ทีมเลือกเอง ไม่ได้มาจาก spec | ใช้เป็น backend สำหรับ Booking Service, Availability Service, Notification Service |
| TLS 1.2+ | NFR-SEC-01 | ใช้ในการรับส่งข้อมูลและส่งต่อข้อมูลสุขภาพ/ข้อมูลการจองแบบปลอดภัย |
| SMS/LINE async gateway | IF-NOT-01 | จัดการส่งข้อความยืนยันแบบไม่รอผล และให้มี retry ตามเงื่อนไข |

## 3. โมเดลข้อมูล

| Entity | ฟิลด์หลัก | รองรับ FR |
|---|---|---|
| bookings | booking_id, patient_hn, package_id, booking_date, slot_start_time, slot_end_time, queue_number, status, created_at, created_by | FR-BKG-02, FR-BKG-04, FR-BKG-05 |
| slot_capacity | slot_date, slot_start_time, slot_end_time, package_id, quota, booked_count, last_updated_at | FR-BKG-01, FR-BKG-03, FR-BKG-06 |
| patient_booking_summary | patient_hn, booking_date, latest_booking_id, latest_queue_number, has_active_booking | FR-BKG-02 |
| notification_jobs | notification_id, booking_id, channel, status, retry_count, scheduled_at, last_attempt_at, reason | FR-BKG-04, FR-BKG-05, NFR-REL-02 |
| audit_logs | audit_id, accessed_by, accessed_at, patient_hn, resource_type, action | DOM-PDPA-01 |

หมายเหตุ: ไม่เก็บเลขบัตรประชาชนในตารางการจองตาม IF-HIS-01 และไม่มีฟิลด์ citizen_id, cccd, national_id ใน entity bookings หรือ slot_capacity

## 4. API / หน้าจอ

- GET /api/booking/slots?date=YYYY-MM-DD&packageId=... -> input: packageId, date range; output: รายการวัน/ช่วงเวลา/จำนวนที่นั่งคงเหลือ -> รองรับ FR-BKG-01, FR-BKG-06
- POST /api/booking/validate -> input: patient_hn, packageId, bookingDate, slotId; output: เงื่อนไข success/error + queue_number เดิม ถ้ามีคิวที่ยังไม่ได้ใช้ -> รองรับ FR-BKG-02, FR-BKG-03
- POST /api/bookings -> input: patient_hn, packageId, bookingDate, slotId; output: booking_id, queue_number, confirmation_status -> รองรับ FR-BKG-04
- POST /api/notifications/retry -> input: booking_id, channel; output: retry_queued -> รองรับ FR-BKG-05, NFR-REL-02
- GET /api/bookings/{bookingId} -> input: bookingId; output: queue_number, booking status, notification status -> รองรับ FR-BKG-05
- หน้า Booking Selection Page -> แสดงตารางวัน/ช่วงเวลา/จำนวนที่นั่งคงเหลือ และปุ่มยืนยัน -> รองรับ FR-BKG-01, FR-BKG-03, FR-BKG-06
- หน้า Booking Result Page -> แสดงหมายเลขคิวและสถานะข้อความยืนยัน พร้อมปุ่ม “ยังไม่ได้รับข้อความ / Retry” -> รองรับ FR-BKG-04, FR-BKG-05

## 5. ตารางตรวจ Constraints

| Constraint ID | ถูกนำไปใช้ที่ไหนใน plan | สถานะ |
|---|---|---|
| CON-TECH-01 | MySQL ในโมเดลข้อมูลและการออกแบบฐานข้อมูล | ใช้แล้ว |
| DOM-PDPA-01 | audit_logs + Audit Log Service + หน้า/endpoint ที่เข้าถึงข้อมูลการจอง | ใช้แล้ว |
| IF-IDP-01 | Booking Validation Flow และ API validate ก่อนเข้าใช้งานข้อมูลผู้รับบริการ | ใช้แล้ว |
| IF-HIS-01 | patient_hn ใช้แทนเลขบัตรประชาชน; bookings ไม่เก็บเลขบัตรประชาชน | ใช้แล้ว |
| IF-NOT-01 | Notification Service + retry endpoint + async queue | ใช้แล้ว |

## 6. แผนทดสอบจาก Acceptance Criteria

| AC ID | ชื่อ test | ทดสอบอย่างไร |
|---|---|---|
| AC-BKG-01 | test_AC_BKG_01_booking_success_with_one_slot | สร้าง slot ว่าง 1 ที่ใน 09.00 น. แล้วยืนยันจอง ตรวจว่าบันทึกสำเร็จ แสดง queue number และ slot ลดเหลือ 0 |
| AC-BKG-02 | test_AC_BKG_02_reject_duplicate_booking_same_day | สร้าง booking ที่ยังไม่ได้ใช้ในวันเดียวกัน แล้วลองจองใหม่อีกครั้ง ตรวจว่าปฏิเสธและแสดง queue number เดิม |
| AC-BKG-03 | test_AC_BKG_03_show_alternatives_when_slot_full | ทำให้ slot เต็มก่อนยืนยันแล้วลองจองอีกครั้ง ตรวจว่าระบบแจ้ง “ช่วงเวลาเต็ม” แสดง 3 ตัวเลือก และไม่มี double booking |
| AC-BKG-04 | test_AC_BKG_04_retry_when_user_did_not_receive_message | จำลอง SMS/LINE ส่งไม่สำเร็จหรือผู้ใช้กด “ยังไม่ได้รับข้อความ / Retry” ตรวจว่าการจองยังถูกบันทึก พร้อม queue number และมี retry job ภายใน 1 นาที |
| AC-BKG-05 | test_AC_BKG_05_search_slots_performance | ใช้โหลด 200 ผู้ใช้พร้อมกันเรียก GET /api/booking/slots ตรวจว่าค่า p95 <= 2 วินาที |
| AC-BKG-06 | test_AC_BKG_06_audit_log_recorded | เปิดดูข้อมูลการจองโดยผู้ใช้หนึ่งคน ตรวจว่ามี audit log ที่ระบุผู้เข้าถึง เวลา และรหัสผู้รับบริการ |

## 7. ลำดับงาน

1. กำหนด schema และ data model สำหรับ bookings, slot_capacity, notification_jobs และ audit_logs -> รองรับ FR-BKG-01, FR-BKG-04, DOM-PDPA-01
2. สร้าง API ค้นหาช่วงเวลา/จำนวนที่นั่งคงเหลือ -> รองรับ FR-BKG-01, AC-BKG-05
3. สร้าง flow ตรวจสอบคิวที่ยังไม่ได้ใช้ในวันเดียวกันและปฏิเสธการจองซ้ำ -> รองรับ FR-BKG-02, AC-BKG-02
4. สร้าง flow ยืนยันการจองและบันทึก booking พร้อมตัดจำนวนที่นั่ง -> รองรับ FR-BKG-04, AC-BKG-01
5. สร้าง handling เมื่อ slot เต็มระหว่างยืนยัน ให้แสดงช่วงเวลาใกล้เคียง 3 ตัวเลือก -> รองรับ FR-BKG-03, AC-BKG-03
6. สร้าง Notification Service แบบ async และ retry queue ด้วยปุ่ม “ยังไม่ได้รับข้อความ / Retry” -> รองรับ FR-BKG-05, NFR-REL-02, AC-BKG-04
7. สร้างฟังก์ชันคำนวณ slot ใหม่เมื่อเปลี่ยนแพ็กเกจ -> รองรับ FR-BKG-06
8. เพิ่ม audit log และตรวจสอบความมั่นคงด้านความปลอดภัย -> รองรับ DOM-PDPA-01, IF-IDP-01, IF-HIS-01, NFR-SEC-01
9. ทดสอบครบทุก AC และปรับ performance -> รองรับ AC-BKG-01 ถึง AC-BKG-06

## 8. สิ่งที่ยังไม่ทำ

- ไม่มี Open Question ที่ค้างสำหรับข้อ “ช่วงเวลาใกล้เคียง” หลังจากทีมตัดสินใจให้คำนวณเฉพาะภายในวันเดียวกัน

## 9. รายงานทีม

1. Constraint ที่ยังไม่ได้ใช้: ไม่มีข้อใดที่ยังไม่ได้ใช้ใน plan นี้ทั้งหมดแล้วถูกนำไปใช้ครบตามข้อจำกัด
2. AC ที่ทดสอบยากหรือทดสอบไม่ได้ในสภาพแวดล้อมของนักศึกษา: AC-BKG-05 (performance 200 users p95 <= 2 sec) และ AC-BKG-04 (SMS/LINE async + retry ทั้งระบบจริง) ยากต่อการจำลองแบบครบถ้วนในสภาพแวดล้อมนักศึกษา
3. สิ่งที่อยากเดาแต่ไม่ได้เดา: การคำนวณ “ช่วงเวลาใกล้เคียง 3 ตัวเลือก” ควรพิจารณาวันเดียวกันหรือรวมวันถัดไปด้วย และควรใช้เกณฑ์ความใกล้แบบใด เพราะเรื่องนี้ยังติด Open Question Q-01

สรุป: plan นี้สรุปวิธีสร้างระบบจาก spec v2 โดยยึด ID ใน spec ทุกบรรทัด และยังคงเว้นสิ่งที่ต้องถามทีมก่อนเริ่มงานจริงไว้ตาม Open Question
