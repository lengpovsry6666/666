import os
import sys
from app import app, db
from models import User, Product, Drone, SubscriptionPlan

def seed_database():
    """Seed the database with initial data"""
    
    # Clear existing data
    db.drop_all()
    db.create_all()
    
    # Create admin user
    admin = User(
        email='admin@aigrit.com',
        first_name='Admin',
        last_name='User',
        phone='+32123456789',
        is_admin=True
    )
    admin.set_password('admin123')
    db.session.add(admin)
    
    # Create sample customer
    customer = User(
        email='customer@example.com',
        first_name='John',
        last_name='Doe',
        phone='+32987654321'
    )
    customer.set_password('customer123')
    db.session.add(customer)
    
    # Create sample products
    products = [
        Product(name='Classic Sourdough', description='Traditional sourdough bread with crispy crust', price=3.50, category='bread', image_url='https://images.unsplash.com/photo-1598373182133-52452f7691ef'),
        Product(name='Whole Wheat Bread', description='Healthy whole wheat bread rich in fiber', price=3.00, category='bread', image_url='https://images.unsplash.com/photo-1509440159596-0249088772ff'),
        Product(name='Croissant', description='Buttery French croissant, freshly baked', price=2.00, category='pastry', image_url='https://images.unsplash.com/photo-1530610476181-d83430b64dcd'),
        Product(name='Baguette', description='Classic French baguette with perfect crust', price=2.50, category='bread', image_url='https://images.unsplash.com/photo-1599599810769-bcde5a160d32'),
    ]
    
    for product in products:
        db.session.add(product)
    
    # Create sample drones
    drones = [
        Drone(serial_number='DRN001', model='DJI Mavic 3', battery_level=100, max_payload=2.0, max_range=15.0),
        Drone(serial_number='DRN002', model='DJI Mini 3', battery_level=95, max_payload=1.5, max_range=12.0),
        Drone(serial_number='DRN003', model='Autel Robotics EVO Nano', battery_level=85, max_payload=1.0, max_range=10.0),
    ]
    
    for drone in drones:
        db.session.add(drone)
    
    # Create subscription plans
    subscription_plans = [
        SubscriptionPlan(name='Weekly', price=2.00, billing_cycle='weekly', delivery_frequency=3, discount_percentage=10),
        SubscriptionPlan(name='Monthly', price=6.00, billing_cycle='monthly', delivery_frequency=12, discount_percentage=20),
        SubscriptionPlan(name='Premium Monthly', price=10.00, billing_cycle='monthly', delivery_frequency=20, discount_percentage=25),
    ]
    
    for plan in subscription_plans:
        db.session.add(plan)
    
    db.session.commit()
    print("Database seeded successfully!")

if __name__ == '__main__':
    with app.app_context():
        seed_database()