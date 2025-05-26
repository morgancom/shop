import os

def create_upload_directories():
    directories = [
        'static/images/brands',
        'static/images/products',
        'static/images/avatars',
        'migrations'
    ]
    
    for directory in directories:
        path = os.path.join(os.path.dirname(os.path.abspath(__file__)), directory)
        os.makedirs(path, exist_ok=True)
        print(f"Created directory: {directory}")

if __name__ == '__main__':
    create_upload_directories()
