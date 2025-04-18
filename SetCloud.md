## Setting Up Your Prisma PostgreSQL Database on AWS RDS

### Step 1: Update Your .env File

Replace YOUR_PASSWORD_HERE in the .env file with your actual RDS database password. This is critical for connecting to your database.

### Step 2: Install Required Dependencies

Run the following command to install all required dependencies:

```
npm install @prisma/client prisma ts-node
```

### Step 3: Configure RDS Security Group

Ensure your RDS instance is accessible from your application:

In the AWS RDS console, go to your database instance
Under Security Groups, add an inbound rule to allow traffic on port 5432 from your application's IP address

### Step 4: Initialize Your Database

```
# Generate Prisma client
npx prisma generate

# Push your schema to the database
npx prisma db push

# Seed the database with initial data
npx prisma db seed
```

### Step 5: Test the Connection

Access your API endpoint to test the database connection:

```
http://localhost:3000/api/test-db
```

This should return a success message if your connection is working properly.

## Troubleshooting Tips

### Test Connection from Terminal:

```
psql -h eventticketing.cv48848ec02t.us-east-2.rds.amazonaws.com -U postgres -d postgres
```

The password of my AWS is `12345678`

### .env Setting

```
DATABASE_URL="postgresql://postgres:12345678@eventticketing.cv48848ec02t.us-east-2.rds.amazonaws.com:5432/postgres"
NEXT_PUBLIC_API_BASE_URL="http://localhost:3000"
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NEXTAUTH_SECRET="some_complex_secret_value"
RESEND_API_KEY=YourPassword
EMAIL_FROM=YourEmail

# WebSockets
NEXT_PUBLIC_SOCKET_URL="http://localhost:3000"

# AWS S3 Configuration
AWS_REGION= 
AWS_S3_BUCKET_NAME=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=


LOCAL_DATABASE_URL="postgresql://YourLocalUsername:YourLocalPassword@localhost:5432/postgres"
```
