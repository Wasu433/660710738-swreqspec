from sqlalchemy.engine import Engine

from app.db.models import Base


def upgrade(engine: Engine) -> None:
    """สร้างตารางข้อมูลการจองตาม CON-TECH-01, DOM-PDPA-01 และ IF-HIS-01."""
    Base.metadata.create_all(engine)
