import os
from app import app, db, User  # Import User directly from app.py
import logging
import webbrowser
from threading import Timer
from werkzeug.security import generate_password_hash

def setup_directories():
    """Create necessary directories if they don't exist"""
    directories = [
        'static/images',
        'static/images/products', 
        'static/images/avatars',
        'static/images/suppliers',
        'logs'
    ]
    for directory in directories:
        os.makedirs(directory, exist_ok=True)
        print(f"Created directory: {directory}")

def open_browser():
    """Open the browser to the local development server"""
    webbrowser.open_new('http://127.0.0.1:5000/')

def initialize_application():
    """Initialize the database and start the application"""
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    
    try:
        print("Setting up directories...")
        setup_directories()
        
        print("Initializing database...")
        with app.app_context():
            # Drop all tables and recreate
            db.drop_all()
            db.create_all()
            
            # Create admin user
            admin = User(
                name='Admin',
                email='admin@admin.com',
                password=generate_password_hash('admin'),
                user_type='admin'
            )
            db.session.add(admin)
            try:
                db.session.commit()
                print("Created admin user: admin@admin.com / admin")
            except Exception as e:
                db.session.rollback()
                print(f"Error creating admin user: {e}")
                
            # Verify admin user was created
            admin_check = User.query.filter_by(email='admin@admin.com').first()
            if admin_check:
                print("Verified admin user exists in database")
            else:
                print("WARNING: Admin user was not created successfully")

        # Start the browser after 1 second
        if not os.environ.get('WERKZEUG_RUN_MAIN'):
            Timer(1, open_browser).start()
        
        print("\nStarting Flask development server...")
        print("Application will be available at: http://127.0.0.1:5000")
        print("Press Ctrl+C to stop the server\n")
        
        # Development server with debug mode
        app.run(
            host='0.0.0.0',
            port=5000,
            debug=True,
            use_reloader=True
        )
        
    except Exception as e:
        logger.error(f"Initialization error: {e}")
        raise

if __name__ == '__main__':
    initialize_application()