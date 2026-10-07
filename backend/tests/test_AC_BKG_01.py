# test ของ T-03: จองคิวสำเร็จ
# AC-BKG-01 (FR-BKG-04)
from app.db.models import Booking
from tests.conftest import AUTH


# Given: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่าง 1 ที่
# When: ผู้ใช้ยืนยันการจองช่วง 09.00 น.
# Then: บันทึกสำเร็จ; แสดงหมายเลขคิว (รอ Q-02); ที่นั่งว่างของช่วงนั้นเป็น 0
def test_TC_BKG_01_1_booking_success(client, db, make_slot):
    """TC-BKG-01-1: การจองช่วง 09:00 เมื่อมีที่นั่ง 1 ที่ ต้องสำเร็จและลดที่นั่งเหลือเป็น 0"""
    slot = make_slot(start="09:00", remaining=1)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 201
    payload = res.json()
    assert payload["slot_id"] == slot.id
    assert payload["queue_no"] == "A001"
    assert db.query(Booking).count() == 1
    db.refresh(slot)
    assert slot.remaining == 0


# Given: ยืนยันตัวตนแล้ว และช่วง 09.00 น. มีที่นั่งว่างตรง 1 ที่ก่อนยืนยัน (ค่าเริ่มต้นเป็นขอบล่าง)
# When: ผู้ใช้ยืนยันการจองช่วง 09.00 น.
# Then: บันทึกสำเร็จ; ระเบียนการจองถูกสร้าง 1 รายการ; ที่นั่งว่างของช่วงนั้นลดจาก 1 เป็น 0; แสดงหมายเลขคิว (รอ Q-02)
def test_TC_BKG_01_2_booking_at_limit(client, db, make_slot):
    """TC-BKG-01-2: การจองเมื่อเหลือ 1 ที่ต้องเป็นกรณีขอบเขตที่ยังอนุญาต"""
    slot = make_slot(start="09:00", remaining=1)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 201
    assert db.query(Booking).count() == 1
    db.refresh(slot)
    assert slot.remaining == 0
    assert res.json()["queue_no"] == "A001"


# Given: ยืนยันตัวตนแล้ว แต่ช่วง 09.00 น. มีที่นั่งว่าง 0 ที่ก่อนกดยืนยัน
# When: ผู้ใช้กดยืนยันการจองช่วง 09.00 น.
# Then: ไม่บันทึกการจองใหม่; แจ้ง "ช่วงเวลาเต็ม"; ที่นั่งว่างยังคงเป็น 0
def test_TC_BKG_01_3_slot_full_rejected(client, db, make_slot):
    """TC-BKG-01-3: การจองเมื่อช่วงเวลานั้นเต็ม ต้องถูกปฏิเสธและไม่สร้างการจอง"""
    slot = make_slot(start="09:00", remaining=0)

    res = client.post("/bookings", json={"slot_id": slot.id}, headers=AUTH)

    assert res.status_code == 409
    assert res.json()["detail"] == "ช่วงเวลาเต็ม"
    assert db.query(Booking).count() == 0
    db.refresh(slot)
    assert slot.remaining == 0
