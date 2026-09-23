import importlib
from pathlib import Path
import sys

from sqlalchemy import create_engine
from sqlalchemy.orm import Session
import pytest

sys.path.insert(0, str(Path(__file__).parents[1]))

init_schema = importlib.import_module("app.db.migrations.001_init")


@pytest.fixture
def database_engine():
    engine = create_engine("sqlite:///:memory:")
    init_schema.upgrade(engine)
    yield engine
    engine.dispose()


@pytest.fixture
def database_session(database_engine):
    with Session(database_engine) as session:
        yield session
