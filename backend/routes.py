from flask import jsonify, request
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_mail import Message
from app import app, db, mail

# Import models inside functions to avoid circular imports
def get_models():
    from models import User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription
    return User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription
import uuid
from datetime import datetime, timedelta
import stripe
from geopy.distance import geodesic

# Stripe configuration
stripe.api_key = "sk_test_your_stripe_secret_key"

# Authentication Routes
@app.route('/api/auth/register', methods=['POST'])
def register():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    data = request.get_json()
    
    # Check if user already exists
    if User.query.filter_by(email=data['email']).first():
        return jsonify({'message': 'Email already registered'}), 400
    
    # Create new user
    user = User(
        email=data['email'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone', '')
    )
    user.set_password(data['password'])
    
    db.session.add(user)
    db.session.commit()
    
    return jsonify({'message': 'User created successfully'}), 201

@app.route('/api/auth/login', methods=['POST'])
def login():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    data = request.get_json()
    user = User.query.filter_by(email=data['email']).first()
    
    if user and user.check_password(data['password']):
        access_token = create_access_token(identity=user.id)
        return jsonify({
            'access_token': access_token,
            'user': {
                'id': user.id,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'is_admin': user.is_admin
            }
        }), 200
    
    return jsonify({'message': 'Invalid credentials'}), 401

# Product Routes
@app.route('/api/products', methods=['GET'])
def get_products():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    products = Product.query.filter_by(is_active=True).all()
    return jsonify([{
        'id': p.id,
        'name': p.name,
        'description': p.description,
        'price': p.price,
        'category': p.category,
        'image_url': p.image_url
    } for p in products])

@app.route('/api/products/<int:product_id>', methods=['GET'])
def get_product(product_id):
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    product = Product.query.get_or_404(product_id)
    if not product.is_active:
        return jsonify({'message': 'Product not available'}), 404
    
    return jsonify({
        'id': product.id,
        'name': product.name,
        'description': product.description,
        'price': product.price,
        'category': product.category,
        'image_url': product.image_url
    })

# Order Routes
@app.route('/api/orders', methods=['POST'])
@jwt_required()
def create_order():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    # Validate order data
    if not data.get('items') or not data.get('delivery_address'):
        return jsonify({'message': 'Missing required fields'}), 400
    
    # Calculate total amount
    total_amount = 0
    order_items = []
    
    for item_data in data['items']:
        product = Product.query.get(item_data['product_id'])
        if not product or not product.is_active:
            return jsonify({'message': f'Product {item_data["product_id"]} not available'}), 400
        
        item_total = product.price * item_data['quantity']
        total_amount += item_total
        
        order_item = OrderItem(
            product_id=product.id,
            quantity=item_data['quantity'],
            unit_price=product.price,
            total_price=item_total
        )
        order_items.append(order_item)
    
    # Create order
    order = Order(
        user_id=current_user_id,
        order_number=f"AIGRIT-{uuid.uuid4().hex[:8].upper()}",
        total_amount=total_amount,
        delivery_latitude=data['delivery_address']['latitude'],
        delivery_longitude=data['delivery_address']['longitude'],
        status='pending'
    )
    
    # Assign available drone
    available_drone = Drone.query.filter_by(status='available').first()
    if available_drone:
        order.drone_id = available_drone.id
        available_drone.status = 'in_flight'
    
    # Set estimated delivery time (30 minutes from now)
    order.estimated_delivery_time = datetime.utcnow() + timedelta(minutes=30)
    
    db.session.add(order)
    db.session.flush()  # Get order ID
    
    # Add order items
    for item in order_items:
        item.order_id = order.id
        db.session.add(item)
    
    # Add initial delivery status
    delivery_status = DeliveryStatus(
        order_id=order.id,
        status='preparing',
        latitude=order.delivery_latitude,
        longitude=order.delivery_longitude,
        notes='Order received and being prepared'
    )
    db.session.add(delivery_status)
    
    db.session.commit()
    
    return jsonify({
        'message': 'Order created successfully',
        'order_id': order.id,
        'order_number': order.order_number,
        'estimated_delivery_time': order.estimated_delivery_time.isoformat()
    }), 201

@app.route('/api/orders/<int:order_id>/status', methods=['GET'])
@jwt_required()
def get_order_status(order_id):
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    current_user_id = get_jwt_identity()
    order = Order.query.filter_by(id=order_id, user_id=current_user_id).first_or_404()
    
    # Get latest delivery status
    latest_status = DeliveryStatus.query.filter_by(order_id=order_id)\
        .order_by(DeliveryStatus.timestamp.desc()).first()
    
    # Get drone info if assigned
    drone_info = None
    if order.drone_id:
        drone = Drone.query.get(order.drone_id)
        drone_info = {
            'id': drone.id,
            'serial_number': drone.serial_number,
            'battery_level': drone.battery_level,
            'current_location': {
                'latitude': drone.current_latitude,
                'longitude': drone.current_longitude
            } if drone.current_latitude and drone.current_longitude else None
        }
    
    return jsonify({
        'order_id': order.id,
        'order_number': order.order_number,
        'status': order.status,
        'estimated_delivery_time': order.estimated_delivery_time.isoformat() if order.estimated_delivery_time else None,
        'actual_delivery_time': order.actual_delivery_time.isoformat() if order.actual_delivery_time else None,
        'latest_status': {
            'status': latest_status.status,
            'timestamp': latest_status.timestamp.isoformat(),
            'location': {
                'latitude': latest_status.latitude,
                'longitude': latest_status.longitude
            },
            'notes': latest_status.notes
        } if latest_status else None,
        'drone_info': drone_info
    })

# Address Routes
@app.route('/api/addresses', methods=['POST'])
@jwt_required()
def add_address():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    current_user_id = get_jwt_identity()
    data = request.get_json()
    
    address = Address(
        user_id=current_user_id,
        street=data['street'],
        city=data['city'],
        postal_code=data['postal_code'],
        country=data['country'],
        latitude=data.get('latitude'),
        longitude=data.get('longitude'),
        is_default=data.get('is_default', False)
    )
    
    # If this is default address, unset others
    if address.is_default:
        Address.query.filter_by(user_id=current_user_id, is_default=True).update({'is_default': False})
    
    db.session.add(address)
    db.session.commit()
    
    return jsonify({'message': 'Address added successfully'}), 201

@app.route('/api/addresses', methods=['GET'])
@jwt_required()
def get_addresses():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    current_user_id = get_jwt_identity()
    addresses = Address.query.filter_by(user_id=current_user_id).all()
    
    return jsonify([{
        'id': addr.id,
        'street': addr.street,
        'city': addr.city,
        'postal_code': addr.postal_code,
        'country': addr.country,
        'latitude': addr.latitude,
        'longitude': addr.longitude,
        'is_default': addr.is_default
    } for addr in addresses])

# Payment Routes
@app.route('/api/payment/create-checkout-session', methods=['POST'])
@jwt_required()
def create_checkout_session():
    data = request.get_json()
    order_id = data.get('order_id')
    
    order = Order.query.get_or_404(order_id)
    
    try:
        checkout_session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'eur',
                    'product_data': {
                        'name': f'Aigrit Order #{order.order_number}',
                    },
                    'unit_amount': int(order.total_amount * 100),  # Convert to cents
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url='http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}',
            cancel_url='http://localhost:3000/cancel',
        )
        
        return jsonify({'checkout_url': checkout_session.url})
    except Exception as e:
        return jsonify({'error': str(e)}), 400

# Admin Routes
@app.route('/api/admin/products', methods=['POST'])
@jwt_required()
def create_product():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403
    
    data = request.get_json()
    
    product = Product(
        name=data['name'],
        description=data['description'],
        price=data['price'],
        category=data['category'],
        image_url=data.get('image_url', ''),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(product)
    db.session.commit()
    
    return jsonify({'message': 'Product created successfully'}), 201

@app.route('/api/admin/drones', methods=['GET'])
@jwt_required()
def get_drones():
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    current_user_id = get_jwt_identity()
    user = User.query.get(current_user_id)
    
    if not user.is_admin:
        return jsonify({'message': 'Admin access required'}), 403
    
    drones = Drone.query.all()
    
    return jsonify([{
        'id': drone.id,
        'serial_number': drone.serial_number,
        'model': drone.model,
        'status': drone.status,
        'battery_level': drone.battery_level,
        'current_location': {
            'latitude': drone.current_latitude,
            'longitude': drone.current_longitude
        } if drone.current_latitude and drone.current_longitude else None
    } for drone in drones])

# Drone Tracking Routes
@app.route('/api/drones/<int:drone_id>/location', methods=['PUT'])
def update_drone_location(drone_id):
    # This would typically be called by drone hardware
    User, Product, Order, OrderItem, Address, Drone, DeliveryStatus, SubscriptionPlan, UserSubscription = get_models()
    data = request.get_json()
    
    drone = Drone.query.get_or_404(drone_id)
    drone.current_latitude = data['latitude']
    drone.current_longitude = data['longitude']
    drone.battery_level = data.get('battery_level', drone.battery_level)
    
    # Update associated order status if drone is delivering
    if drone.status == 'in_flight':
        order = Order.query.filter_by(drone_id=drone_id, status='delivering').first()
        if order:
            distance = geodesic(
                (drone.current_latitude, drone.current_longitude),
                (order.delivery_latitude, order.delivery_longitude)
            ).kilometers
            
            # Update delivery status
            delivery_status = DeliveryStatus(
                order_id=order.id,
                status='in_transit',
                latitude=drone.current_latitude,
                longitude=drone.current_longitude,
                notes=f'Drone {distance:.2f}km from destination'
            )
            db.session.add(delivery_status)
            
            # If close to destination, mark as delivered
            if distance < 0.1:  # Less than 100 meters
                order.status = 'delivered'
                order.actual_delivery_time = datetime.utcnow()
                drone.status = 'available'
                
                final_status = DeliveryStatus(
                    order_id=order.id,
                    status='delivered',
                    latitude=order.delivery_latitude,
                    longitude=order.delivery_longitude,
                    notes='Package delivered successfully'
                )
                db.session.add(final_status)
    
    db.session.commit()
    
    return jsonify({'message': 'Drone location updated'})

# Contact Form Email Route
@app.route('/api/contact/send-email', methods=['POST'])
def send_contact_email():
    try:
        data = request.get_json()
        
        # Validate required fields
        required_fields = ['name', 'email', 'phone', 'subject', 'message']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'message': f'Missing required field: {field}'}), 400
        
        # Create email message
        subject = f"Contact Form Submission - {data['subject']}"
        sender_email = data['email']
        recipient_email = app.config['MAIL_USERNAME']  # Your email from config
        
        # Format email content
        email_body = f"""
New Contact Form Submission
=============================

Personal Information:
-------------------
Name: {data['name']}
Email: {data['email']}
Phone: {data['phone']}
Subject: {data['subject']}

Message:
--------
{data['message']}

Cart Information:
---------------
Current Cart Items: {data.get('cartItemCount', 0)}

Cart Details:
{chr(10).join([f"{i+1}. {item['name']} - Quantity: {item['quantity']} - Price: €{item['price']}" for i, item in enumerate(data.get('cartItems', []))])}

Total Cart Value: €{data.get('totalCartValue', 0):.2f}

Submission Time: {data.get('submissionTime', 'Not provided')}
        """
        
        # Create message
        msg = Message(
            subject=subject,
            sender=(data['name'], sender_email),
            recipients=[recipient_email],
            body=email_body
        )
        
        # Send email
        mail.send(msg)
        
        return jsonify({
            'message': 'Email sent successfully',
            'status': 'success'
        }), 200
        
    except Exception as e:
        print(f"Email sending error: {str(e)}")
        return jsonify({
            'message': 'Failed to send email',
            'error': str(e)
        }), 500

# Error handlers
@app.errorhandler(404)
def not_found(error):
    return jsonify({'message': 'Resource not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    db.session.rollback()
    return jsonify({'message': 'Internal server error'}), 500