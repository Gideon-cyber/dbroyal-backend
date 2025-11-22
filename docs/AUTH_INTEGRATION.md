# Auth Module Integration

## Changes Made

### 1. **Integrated Auth Module with Users Module**

- Added `UsersModule` and `PrismaModule` imports to `AuthModule`
- Updated `AuthService` to use `PrismaService` instead of in-memory storage
- All user authentication data is now persisted in the database

### 2. **Updated Auth Service**

- Removed in-memory user array
- Integrated with Prisma to store/retrieve users from the database
- Password hashing maintained using bcrypt (10 salt rounds)
- JWT tokens now include user role in payload

### 3. **Enhanced DTOs**

- Added optional `role` field to `SignUpDto`
- Users can now specify their role during signup (defaults to PHOTOGRAPHER)

### 4. **Improved Users Service**

- Added password hashing to `create` method
- Added `findByEmail` method for user lookups
- Ensures passwords are always hashed before storage

### 5. **Created Database Seed Script**

- Added `prisma/seed.ts` for database seeding
- Creates a default manager user with credentials:
  - **Email**: `manager@dbroyal.com`
  - **Password**: `Manager@123`
  - **Role**: MANAGER

## Testing the Integration

### 1. Login as Manager

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manager@dbroyal.com",
    "password": "Manager@123"
  }'
```

### 2. Register a New User

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "photographer@dbroyal.com",
    "password": "Photo@123",
    "name": "John Photographer",
    "role": "PHOTOGRAPHER"
  }'
```

### 3. Get Profile (Protected Route)

```bash
# Use the token from login/signup response
curl -X GET http://localhost:3000/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

## Benefits of Integration

✅ **Persistent Storage**: User data survives server restarts  
✅ **Database-backed**: Uses existing Prisma infrastructure  
✅ **Consistent**: Auth and Users modules work together  
✅ **Scalable**: Ready for production use  
✅ **Secure**: Password hashing with bcrypt  
✅ **Role-based**: Supports MANAGER, PHOTOGRAPHER, EDITOR, ASSISTANT roles

## Next Steps

1. Add role-based access control (RBAC) guards
2. Implement refresh token functionality
3. Add email verification
4. Add password reset functionality
5. Change the default manager password
