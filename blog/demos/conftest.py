"""Shared pytest configuration for all blog demo tests."""


def pytest_configure(config):
    config.addinivalue_line(
        "markers",
        "integration: marks tests as integration tests (require running services)",
    )
