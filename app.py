from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
from flask_mail import Mail, Message
import secrets
import os
from werkzeug.utils import secure_filename
from functools import wraps
from flask_login import LoginManager, UserMixin, login_user, logout_user, login_required, current_user
from dotenv import load_dotenv
import logging
from logging.handlers import RotatingFileHandler

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Basic configurations for local development
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY') or secrets.token_hex(32)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///shop2.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['UPLOAD_FOLDER'] = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'static/images')
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Simplified security settings for development
app.config['SESSION_COOKIE_SECURE'] = False
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_COOKIE_SAMESITE'] = 'Lax'

# Setup logging
if not os.path.exists('logs'):
    os.mkdir('logs')
file_handler = RotatingFileHandler('logs/shop.log', maxBytes=10240, backupCount=10)
file_handler.setFormatter(logging.Formatter(
    '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
))
file_handler.setLevel(logging.INFO)
app.logger.addHandler(file_handler)
app.logger.setLevel(logging.INFO)
app.logger.info('Shop startup')

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# Initialize Flask-Login
login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

# Models (simplified for local use)
class User(db.Model, UserMixin):
    __tablename__ = 'users'  # Explicitly set table name
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password = db.Column(db.String(200), nullable=False)
    user_type = db.Column(db.String(20), nullable=False, default='buyer')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    avatar = db.Column(db.String(200), default='default-avatar.png')
    phone = db.Column(db.String(20))  # Add phone attribute
    address = db.Column(db.Text)  # Add address attribute
    bio = db.Column(db.Text)  # Add bio attribute
    website = db.Column(db.String(200))  # Add website attribute

    def __repr__(self):
        return f'<User {self.email}>'

class Product(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    price = db.Column(db.Float, nullable=False)
    category = db.Column(db.String(50), nullable=False)
    image = db.Column(db.String(200), nullable=False, default='default-product.png')
    stock = db.Column(db.Integer, default=0)
    rating = db.Column(db.Float, default=0.0)  # Add rating field with default value
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    discount_price = db.Column(db.Float)  # Add discount price field
    brand_id = db.Column(db.Integer, db.ForeignKey('brand.id'))
    is_new = db.Column(db.Boolean, default=True)
    discount_start = db.Column(db.DateTime)
    discount_end = db.Column(db.DateTime)
    
    brand = db.relationship('Brand', backref='products')

class Order(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed from 'user.id' to 'users.id'
    status = db.Column(db.String(20), default='pending')
    total = db.Column(db.Float, nullable=False)
    shipping_address = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Add relationships
    user = db.relationship('User', backref='orders')
    items = db.relationship('OrderItem', backref='order')

class OrderItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.Integer, db.ForeignKey('order.id'), nullable=False)
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False)
    price = db.Column(db.Float, nullable=False)
    
    # Add relationship
    product = db.relationship('Product', backref='order_items')

class CartItem(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)  # Changed from 'user.id' to 'users.id'
    product_id = db.Column(db.Integer, db.ForeignKey('product.id'), nullable=False)
    quantity = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    # Add relationship to Product model
    product = db.relationship('Product', backref='cart_items')

# Add Brand model after other models
class Brand(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    logo = db.Column(db.String(200), default='default-brand.png')
    description = db.Column(db.Text)
    website = db.Column(db.String(200))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

# Routes
@app.route('/')
def index():
    # Fetch featured, new, and best-selling products
    featured_products = Product.query.limit(8).all()
    new_products = Product.query.order_by(Product.created_at.desc()).limit(8).all()
    best_sellers = Product.query.order_by(Product.stock.desc()).limit(8).all()
    
    return render_template(
        'index.html',
        featured_products=featured_products,
        new_products=new_products,
        best_sellers=best_sellers
    )

@app.route('/products')
def products():
    try:
        # Get query parameters
        page = request.args.get('page', 1, type=int)
        per_page = 12
        search_query = request.args.get('q', '').strip()
        category = request.args.get('category', '').strip()
        
        # Base query
        query = Product.query
        
        # Apply search filter
        if search_query:
            query = query.filter(Product.name.ilike(f'%{search_query}%'))
        
        # Apply category filter
        if category:
            query = query.filter_by(category=category)
        
        # Paginate results
        pagination = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return render_template(
            'products.html',
            products=pagination.items,
            pagination=pagination,
            search_query=search_query,
            current_category=category
        )
    except Exception as e:
        app.logger.error(f"Error in products route: {str(e)}")
        flash('An error occurred while loading products', 'error')
        return redirect(url_for('index'))

@app.route('/product/<int:id>')
def product_detail(id):
    product = Product.query.get_or_404(id)
    return render_template('product_detail.html', product=product)

@app.route('/cart')
@login_required
def cart():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    # Now we can safely access item.product
    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    shipping = 10.00 if cart_items else 0
    tax = subtotal * 0.1
    total = subtotal + shipping + tax
    
    return render_template('cart.html',
                         cart_items=cart_items,
                         subtotal=subtotal,
                         shipping=shipping,
                         tax=tax,
                         total=total)

@app.route('/cart/add', methods=['POST'])
@login_required
def add_to_cart():
    try:
        product_id = request.form.get('product_id')
        quantity = int(request.form.get('quantity', 1))
        
        if not product_id:
            return jsonify({'error': 'Product ID is required'}), 400
        
        product = Product.query.get_or_404(product_id)
        
        # Check stock
        if product.stock < quantity:
            return jsonify({'error': 'Not enough stock available'}), 400
            
        cart_item = CartItem.query.filter_by(
            user_id=current_user.id,
            product_id=product_id
        ).first()

        if cart_item:
            cart_item.quantity += quantity
        else:
            cart_item = CartItem(
                user_id=current_user.id,
                product_id=product_id,
                quantity=quantity
            )
            db.session.add(cart_item)

        db.session.commit()
        
        # Get updated cart count
        cart_count = CartItem.query.filter_by(user_id=current_user.id).count()
        
        return jsonify({
            'message': 'Product added to cart',
            'cart_count': cart_count
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/cart/update', methods=['POST'])
@login_required
def update_cart():
    try:
        item_id = request.form.get('item_id')
        quantity = int(request.form.get('quantity', 0))
        
        cart_item = CartItem.query.get_or_404(item_id)
        
        if cart_item.user_id != current_user.id:
            return jsonify({'error': 'Unauthorized'}), 403
            
        if quantity <= 0:
            db.session.delete(cart_item)
        else:
            cart_item.quantity = quantity
            
        db.session.commit()
        
        # Calculate new totals
        cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
        subtotal = sum(item.product.price * item.quantity for item in cart_items)
        cart_count = len(cart_items)
        
        return jsonify({
            'message': 'Cart updated',
            'subtotal': f"${subtotal:.2f}",
            'cart_count': cart_count
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@app.route('/checkout', methods=['GET', 'POST'])
@login_required
def checkout():
    cart_items = CartItem.query.filter_by(user_id=current_user.id).all()
    if not cart_items:
        flash('Your cart is empty.', 'error')
        return redirect(url_for('cart'))
    
    # Calculate totals
    subtotal = sum(item.product.price * item.quantity for item in cart_items)
    shipping = 10.00
    tax = subtotal * 0.1
    discount = 0.00  # Ensure discount is defined
    total = subtotal + shipping + tax - discount
    
    if request.method == 'POST':
        payment_method = request.form.get('payment_method')
        if not payment_method:
            flash('Please select a payment method.', 'error')
            return redirect(url_for('checkout'))
        
        # Collect shipping and payment details
        shipping_address = f"{request.form['address']}, {request.form['city']}, {request.form['state']} - {request.form['zipCode']}"
        payment_details = {
            "method": payment_method,
            "info": request.form.get('cardNumber') or request.form.get('paypal_email') or request.form.get('cashapp_id') or request.form.get('venmo_id') or request.form.get('zelle_email') or request.form.get('bitcoin_address')
        }
        
        # Process the order
        try:
            order = Order(
                user_id=current_user.id,
                total=total,
                shipping_address=shipping_address,
                status='pending'
            )
            db.session.add(order)
            
            for item in cart_items:
                order_item = OrderItem(
                    order_id=order.id,
                    product_id=item.product_id,
                    quantity=item.quantity,
                    price=item.product.price
                )
                db.session.add(order_item)
                db.session.delete(item)
            
            db.session.commit()
            
            # Log payment details for admin review
            app.logger.info(f"New order placed by {current_user.email}. Payment details: {payment_details}")
            
            flash(f'Order placed successfully using {payment_method}!', 'success')
            return redirect(url_for('order_confirmation', order_id=order.id))
        except Exception as e:
            db.session.rollback()
            app.logger.error(f"Error processing order: {str(e)}")
            flash('An error occurred while processing your order. Please try again.', 'error')
            return redirect(url_for('checkout'))
    
    return render_template('checkout.html',
                           cart_items=cart_items,
                           subtotal=subtotal,
                           shipping=shipping,
                           tax=tax,
                           discount=discount,  # Pass discount to the template
                           total=total)

@app.route('/order/confirmation/<int:order_id>')
@login_required
def order_confirmation(order_id):
    order = Order.query.get_or_404(order_id)
    if order.user_id != current_user.id:
        flash('Access denied', 'error')
        return redirect(url_for('index'))
    return render_template('order_confirmation.html', order=order)

@app.route('/login', methods=['GET', 'POST'])
def login():
    if current_user.is_authenticated:
        return redirect(url_for('index'))
    
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        user = User.query.filter_by(email=email).first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            next_page = request.args.get('next')
            return redirect(next_page or url_for('index'))
            
        flash('Invalid email or password', 'error')
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        name = request.form['name']
        email = request.form['email']
        password = request.form['password']
        
        if User.query.filter_by(email=email).first():
            flash('Email already registered', 'error')
            return redirect(url_for('register'))
        
        user = User(
            name=name,
            email=email,
            password=generate_password_hash(password),
            user_type='buyer'
        )
        db.session.add(user)
        db.session.commit()
        
        flash('Registration successful! Welcome to Modern E-Shop.', 'success')
        login_user(user)  # Automatically log in the user after registration
        return redirect(url_for('index'))  # Redirect to the index page
    
    return render_template('register.html')

@app.route('/admin/login', methods=['GET', 'POST'])
def admin_login():
    # Redirect to admin dashboard if already logged in as admin
    if current_user.is_authenticated and current_user.user_type == 'admin':
        return redirect(url_for('admin_dashboard'))
        
    if request.method == 'POST':
        email = request.form.get('email')
        password = request.form.get('password')
        
        # Debug logging
        app.logger.info(f"Admin login attempt - Email: {email}")
        
        user = User.query.filter_by(email=email, user_type='admin').first()
        
        if user and check_password_hash(user.password, password):
            login_user(user)
            next_page = request.args.get('next')
            # Redirect to admin dashboard by default
            return redirect(next_page or url_for('admin_dashboard'))
            
        flash('Invalid admin credentials', 'error')
    
    return render_template('admin/login.html')

@app.route('/admin')
def admin_redirect():
    """Redirect /admin to the admin dashboard or login page"""
    if current_user.is_authenticated and current_user.user_type == 'admin':
        return redirect(url_for('admin_dashboard'))
    return redirect(url_for('admin_login'))

@app.route('/logout')
@login_required
def logout():
    was_admin = current_user.user_type == 'admin'
    logout_user()
    # Redirect admin users back to admin login
    if was_admin:
        return redirect(url_for('admin_login'))
    return redirect(url_for('index'))

@app.route('/profile')
@login_required
def profile():
    tab = request.args.get('tab', 'overview')
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).limit(5).all()
    return render_template('profile.html', 
                         user=current_user, 
                         active_tab=tab,
                         orders=orders)

@app.route('/orders')
@login_required
def orders():
    orders = Order.query.filter_by(user_id=current_user.id).order_by(Order.created_at.desc()).all()
    return render_template('orders.html', orders=orders)

@app.route('/profile/settings', methods=['GET', 'POST'])
@login_required
def profile_settings():
    if request.method == 'POST':
        try:
            # Handle avatar upload
            if 'avatar' in request.files:
                file = request.files['avatar']
                if file and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    file_path = os.path.join(app.config['UPLOAD_FOLDER'], 'avatars', filename)
                    file.save(file_path)
                    current_user.avatar = filename

            # Update user information
            current_user.name = request.form.get('name', current_user.name)
            current_user.email = request.form.get('email', current_user.email)
            current_user.phone = request.form.get('phone', current_user.phone)
            current_user.address = request.form.get('address', current_user.address)
            
            # Handle optional fields
            current_user.bio = request.form.get('bio') or current_user.bio
            current_user.website = request.form.get('website') or current_user.website

            db.session.commit()
            flash('Profile updated successfully!', 'success')
            return redirect(url_for('profile_settings'))
        except Exception as e:
            db.session.rollback()
            flash('An error occurred while updating your profile.', 'error')
            app.logger.error(f'Error updating profile: {str(e)}')

    return render_template('profile/settings.html', user=current_user)

# Admin routes
# Admin authentication decorator
def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not current_user.is_authenticated or current_user.user_type != 'admin':
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('admin_login'))
        return f(*args, **kwargs)
    return decorated_function

@app.route('/admin/dashboard')
@login_required
@admin_required
def admin_dashboard():
    stats = {
        'total_users': User.query.count(),
        'total_products': Product.query.count(),
        'total_orders': Order.query.count(),
        'recent_orders': Order.query.order_by(Order.created_at.desc()).limit(5).all(),
        'recent_users': User.query.order_by(User.created_at.desc()).limit(5).all(),
        'low_stock_products': Product.query.filter(Product.stock < 10).all(),
        'active_deals': Product.query.filter(
            Product.discount_price.isnot(None),
            Product.discount_end > datetime.utcnow()
        ).count(),
        'new_arrivals': Product.query.filter(
            Product.created_at >= datetime.utcnow() - timedelta(days=30)
        ).count(),
        'total_brands': Brand.query.count()
    }
    return render_template('admin/dashboard.html', stats=stats)

@app.route('/admin/products')
@login_required
@admin_required
def admin_products():
    products = Product.query.all()
    return render_template('admin/products.html', products=products)

@app.route('/admin/products/new', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_new_product():
    if request.method == 'POST':
        name = request.form['name']
        description = request.form['description']
        price = float(request.form['price'])
        category = request.form['category']
        stock = int(request.form['stock'])
        
        product = Product(
            name=name,
            description=description,
            price=price,
            category=category,
            stock=stock
        )
        
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                product.image = filename
        
        db.session.add(product)
        db.session.commit()
        flash('Product created successfully', 'success')
        return redirect(url_for('admin_products'))
    
    return render_template('admin/new_product.html')

@app.route('/admin/products/edit/<int:id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_product(id):
    product = Product.query.get_or_404(id)
    brands = Brand.query.all()
    
    if request.method == 'POST':
        product.name = request.form['name']
        product.description = request.form['description']
        product.price = float(request.form['price'])
        product.category = request.form['category']
        product.stock = int(request.form['stock'])
        product.brand_id = request.form.get('brand_id', type=int)
        product.discount_price = request.form.get('discount_price', type=float)
        
        if request.form.get('discount_start'):
            product.discount_start = datetime.strptime(
                request.form['discount_start'], '%Y-%m-%dT%H:%M'
            )
        if request.form.get('discount_end'):
            product.discount_end = datetime.strptime(
                request.form['discount_end'], '%Y-%m-%dT%H:%M'
            )
        
        if 'image' in request.files:
            file = request.files['image']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], filename))
                product.image = filename

        db.session.commit()
        flash('Product updated successfully', 'success')
        return redirect(url_for('admin_products'))
    
    return render_template(
        'admin/edit_product.html',
        product=product,
        brands=brands
    )

@app.route('/admin/orders')
@login_required
@admin_required
def admin_orders():
    orders = Order.query.order_by(Order.created_at.desc()).all()
    return render_template('admin/orders.html', orders=orders)

@app.route('/admin/orders/<int:id>')
@login_required
@admin_required
def admin_order_detail(id):
    order = Order.query.get_or_404(id)
    return render_template('admin/order_detail.html', order=order)

@app.route('/admin/orders/<int:id>/update', methods=['POST'])
@login_required
@admin_required
def admin_update_order(id):
    order = Order.query.get_or_404(id)
    status = request.form.get('status')
    if status:
        order.status = status
        db.session.commit()
        flash('Order status updated successfully', 'success')
    return redirect(url_for('admin_order_detail', id=id))

@app.route('/admin/brands')
@login_required
@admin_required
def admin_brands():
    brands = Brand.query.all()
    return render_template('admin/brands.html', brands=brands)

@app.route('/admin/brands/new', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_new_brand():
    if request.method == 'POST':
        brand = Brand(
            name=request.form['name'],
            description=request.form.get('description', ''),
            website=request.form.get('website', '')
        )
        
        if 'logo' in request.files:
            file = request.files['logo']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'brands', filename))
                brand.logo = filename
        
        db.session.add(brand)
        db.session.commit()
        flash('Brand created successfully', 'success')
        return redirect(url_for('admin_brands'))
    
    return render_template('admin/new_brand.html')

@app.route('/admin/brands/edit/<int:id>', methods=['GET', 'POST'])
@login_required
@admin_required
def admin_edit_brand(id):
    brand = Brand.query.get_or_404(id)
    
    if request.method == 'POST':
        brand.name = request.form['name']
        brand.description = request.form.get('description', '')
        brand.website = request.form.get('website', '')
        
        if 'logo' in request.files:
            file = request.files['logo']
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file.save(os.path.join(app.config['UPLOAD_FOLDER'], 'brands', filename))
                brand.logo = filename
        
        db.session.commit()
        flash('Brand updated successfully', 'success')
        return redirect(url_for('admin_brands'))
    
    return render_template('admin/edit_brand.html', brand=brand)

@app.route('/admin/users')
@login_required
@admin_required
def admin_users():
    users = User.query.order_by(User.created_at.desc()).all()
    return render_template('admin/users.html', users=users)

@app.route('/admin/users/<int:id>')
@login_required
@admin_required
def admin_user_detail(id):
    user = User.query.get_or_404(id)
    return render_template('admin/user_detail.html', user=user)

@app.route('/admin/users/<int:id>/update', methods=['POST'])
@login_required
@admin_required
def admin_update_user(id):
    user = User.query.get_or_404(id)
    user.user_type = request.form.get('user_type', 'buyer')
    db.session.commit()
    flash('User role updated successfully', 'success')
    return redirect(url_for('admin_user_detail', id=id))

@app.route('/deals')
def deals():
    # Get products with discounts or special offers
    deals = Product.query.filter(Product.discount_price.isnot(None)).all()
    return render_template('deals.html', deals=deals)

@app.route('/new-arrivals')
def new_arrivals():
    # Get products from last 30 days
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    new_products = Product.query.filter(
        Product.created_at >= thirty_days_ago
    ).order_by(Product.created_at.desc()).all()
    return render_template('new_arrivals.html', products=new_products)

@app.route('/brands')
def brands():
    # In a real app, you would fetch this from a database
    brands = [
        {'name': 'Apple', 'logo': 'apple.png', 'product_count': 15},
        {'name': 'Samsung', 'logo': 'samsung.png', 'product_count': 20},
        {'name': 'Nike', 'logo': 'nike.png', 'product_count': 30},
        {'name': 'Adidas', 'logo': 'adidas.png', 'product_count': 25},
        {'name': 'Sony', 'logo': 'sony.png', 'product_count': 18},
        {'name': 'LG', 'logo': 'lg.png', 'product_count': 12}
    ]
    return render_template('brands.html', brands=brands)

@app.route('/contact', methods=['GET', 'POST'])
def contact():
    if request.method == 'POST':
        name = request.form.get('name')
        email = request.form.get('email')
        message = request.form.get('message')

        # Log the message or send an email (placeholder logic)
        app.logger.info(f"Contact form submitted: {name}, {email}, {message}")
        flash('Your message has been sent successfully!', 'success')
        return redirect(url_for('contact'))

    return render_template('contact.html')

@app.route('/terms')
def terms():
    return render_template('terms.html')

@app.route('/privacy')
def privacy():
    return render_template('privacy.html')

@app.context_processor
def inject_cart_count():
    if current_user.is_authenticated:
        cart_count = CartItem.query.filter_by(user_id=current_user.id).count()
    else:
        cart_count = 0
    return dict(cart_count=cart_count)

@app.context_processor
def inject_categories():
    # Add some default categories if none exist
    default_categories = [('Electronics',), ('Clothing',), ('Home',), ('Books',)]
    return dict(categories=default_categories)

def allowed_file(filename):
    ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/admin/products/delete/<int:id>', methods=['POST'])
@login_required
@admin_required
def admin_delete_product(id):
    product = Product.query.get_or_404(id)
    try:
        db.session.delete(product)
        db.session.commit()
        flash('Product deleted successfully', 'success')
    except Exception as e:
        db.session.rollback()
        flash('Error deleting product', 'error')
        app.logger.error(f"Error deleting product: {str(e)}")
    return redirect(url_for('admin_products'))

if __name__ == '__main__':
    with app.app_context():
        # Create upload directories if they don't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        # Drop all tables and recreate
        db.drop_all()
        db.create_all()
        
        # Create admin user with simple credentials
        admin = User(
            name='Admin',
            email='admin@admin.com',
            password=generate_password_hash('admin'),
            user_type='admin'
        )
        db.session.add(admin)
        db.session.commit()
        print("Created admin user - Email: admin@admin.com, Password: admin")
    
    app.run(debug=True)