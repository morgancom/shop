from alembic import context
from flask import current_app
from flask_migrate import Migrate, MigrateCommand
from flask_script import Manager

def run_migrations():
    """Run database migrations."""
    with current_app.app_context():
        if context.is_offline_mode():
            run_migrations_offline()
        else:
            run_migrations_online()
