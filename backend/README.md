# Aigrit Professional Backend System

## Overview
This is a professional backend system for the Aigrit drone delivery website, built with Python Flask. It provides a complete e-commerce platform with real-time drone tracking, secure payment processing, and comprehensive admin management.

## Features

### Core Functionality
- ✅ **User Authentication**: Secure JWT-based authentication with role-based access control
- ✅ **Product Management**: Full CRUD operations for products and inventory
- ✅ **Order Processing**: Complete order lifecycle from placement to delivery
- ✅ **Real-time Tracking**: Live drone location tracking and delivery status updates
- ✅ **Payment Integration**: Stripe payment processing with secure checkout
- ✅ **Subscription System**: Flexible subscription plans for recurring deliveries
- ✅ **Admin Dashboard**: Comprehensive admin panel for business management

### Technical Features
- ✅ **RESTful API**: Well-documented API endpoints
- ✅ **Database**: SQLAlchemy ORM with PostgreSQL/SQLite support
- ✅ **Security**: bcrypt password hashing, input validation, CORS protection
- ✅ **Scalability**: Docker containerization and microservices architecture
- ✅ **Monitoring**: Comprehensive logging and error handling

## Quick Start

### Prerequisites
- Python 3.8+
- Node.js (for frontend development)
- Docker (optional, for containerized deployment)

### Installation

1. **Clone the repository**
```bash
cd Solo_Wing_Pixy/backend
```

2. **Install dependencies**
```bash
# Unix/Linux/MacOS
./start.sh

# Windows
start.bat
```

3. **Configure environment variables**
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. **Start the development server**
```bash
python app.py
```

The backend will be available at `http://localhost:5000`

## API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Product Endpoints
- `GET /api/products` - List all products
- `GET /api/products/{id}` - Get product details

### Order Endpoints
- `POST /api/orders` - Create new order
- `GET /api/orders/{id}/status` - Get order status

### Admin Endpoints
- `POST /api/admin/products` - Create product (admin only)
- `GET /api/admin/drones` - List all drones (admin only)

### Drone Tracking
- `PUT /api/drones/{id}/location` - Update drone location

## Database Schema

The system uses the following main entities:
- **User**: Customer and admin accounts
- **Product**: Bread and bakery items
- **Order**: Customer orders with status tracking
- **Drone**: Delivery drone fleet management
- **Address**: Customer delivery addresses
- **SubscriptionPlan**: Recurring delivery plans

## Frontend Integration

The backend seamlessly integrates with your existing frontend:

### JavaScript API Client
```javascript
// Initialize API client
const apiClient = new ApiClient();

// Login
await apiClient.login('user@example.com', 'password');

// Get products
const products = await apiClient.getProducts();

// Create order
const order = await apiClient.createOrder(orderData);
```

### Real-time Tracking
```javascript
// Start tracking an order
droneTracker.startTracking(orderId);

// Stop tracking
droneTracker.stopTracking();
```

## Deployment Options

### Development
```bash
python app.py
```

### Production with Docker
```bash
docker-compose up -d
```

### Production with Gunicorn
```bash
gunicorn --bind 0.0.0.0:5000 app:app
```

## Security Features

- JWT token authentication with expiration
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- SQL injection prevention
- Rate limiting
- CORS protection
- HTTPS enforcement in production

## Admin Access

Visit `/pages/login.html` to access the admin dashboard:
- **Username**: admin@aigrit.com
- **Password**: admin123

## Monitoring & Maintenance

### Health Checks
- Database connectivity
- API endpoint availability
- Drone fleet status
- Payment system status

### Logging
All operations are logged with timestamps and user information for audit purposes.

### Backup Strategy
Regular database backups should be configured for production deployments.

## Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Check DATABASE_URL in .env file
   - Ensure PostgreSQL is running (if using PostgreSQL)

2. **Authentication Issues**
   - Verify JWT_SECRET_KEY is set
   - Check token expiration settings

3. **Payment Processing Errors**
   - Confirm Stripe API keys are correct
   - Verify webhook configuration

### Support
For issues and questions, please check the SECURITY.md file for security-related concerns.

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License
This project is proprietary software for Aigrit drone delivery service.