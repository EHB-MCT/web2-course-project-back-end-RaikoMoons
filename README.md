# 🏋️ Gym Management API

A beginner-friendly REST API for managing gym members, built with Node.js, Express, and MongoDB Atlas. This API provides full CRUD (Create, Read, Update, Delete) functionality for gym member management.

## Features ✨

- ✅ Full CRUD operations for gym members
- ✅ MongoDB Atlas cloud database integration
- ✅ Input validation and error handling
- ✅ RESTful API design
- ✅ Beginner-friendly code with detailed comments
- 🎉 **Easter Egg**: Try creating a member with the name "Gym Master"!

## Project Structure 📁

```
gym-api/
├── config/
│   ├── config.js            # Configuration file (create from config.example.js)
│   ├── config.example.js    # Example configuration file
│   └── database.js          # MongoDB connection configuration
├── controllers/
│   └── memberController.js  # Business logic for member operations
├── models/
│   └── Member.js            # Member data model with validation
├── routes/
│   └── memberRoutes.js      # API route definitions
├── middleware/
│   └── errorHandler.js      # Error handling middleware
├── server.js                 # Main application entry point
└── package.json              # Project dependencies
```

## Prerequisites 📋

Before you begin, make sure you have:

- Node.js installed (version 14 or higher)
- npm (Node Package Manager) installed
- A MongoDB Atlas account (free tier works fine)
- A code editor (VS Code recommended)

## Setup Instructions 🚀

### Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages:
- `express` - Web framework for Node.js
- `mongoose` - MongoDB object modeling
- `cors` - Cross-Origin Resource Sharing
- `nodemon` - Auto-restart server during development

### Step 2: Set Up MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free account
2. Create a new cluster (choose the free tier)
3. Create a database user:
   - Go to "Database Access" → "Add New Database User"
   - Choose "Password" authentication
   - Remember your username and password!
4. Whitelist your IP address:
   - Go to "Network Access" → "Add IP Address"
   - Click "Allow Access from Anywhere" (for development) or add your specific IP
5. Get your connection string:
   - Go to "Clusters" → Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (it looks like: `mongodb+srv://username:password@cluster.mongodb.net/...`)

### Step 3: Configure Database Connection

1. Copy the example config file: `cp config/config.example.js config/config.js`
   - Or manually create `config/config.js` based on `config/config.example.js`
2. Open the file `config/config.js` in your project
3. Replace the placeholder values with your actual MongoDB Atlas connection string:

```javascript
MONGODB_URI: "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/gym-db?retryWrites=true&w=majority"
```

**Important**: Replace:
- `YOUR_USERNAME` with your MongoDB Atlas username
- `YOUR_PASSWORD` with your MongoDB Atlas password
- `YOUR_CLUSTER` with your cluster name

You can also change the `PORT` if you want to use a different port (default is 3000).

### Step 4: Run the Server

Start the development server:

```bash
npm run dev
```

Or start the production server:

```bash
npm start
```

You should see:
```
✅ MongoDB Connected: ...
🚀 Server is running on port 3000
🌐 API available at http://localhost:3000
```

## API Endpoints 📡

### Base URL
```
http://localhost:3000/api/members
```

### Available Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/members` | Get all members |
| GET | `/api/members/:id` | Get a single member by ID |
| POST | `/api/members` | Create a new member |
| PUT | `/api/members/:id` | Update a member |
| DELETE | `/api/members/:id` | Delete a member |

### Example Requests

#### Create a Member (POST)
```bash
POST http://localhost:3000/api/members
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "123-456-7890",
  "age": 25,
  "membershipType": "Premium",
  "fitnessGoals": "Build muscle and lose weight"
}
```

#### Get All Members (GET)
```bash
GET http://localhost:3000/api/members
```

#### Get Single Member (GET)
```bash
GET http://localhost:3000/api/members/MEMBER_ID
```

#### Update Member (PUT)
```bash
PUT http://localhost:3000/api/members/MEMBER_ID
Content-Type: application/json

{
  "membershipType": "VIP",
  "fitnessGoals": "Updated goal"
}
```

#### Delete Member (DELETE)
```bash
DELETE http://localhost:3000/api/members/MEMBER_ID
```

## Testing the API 🧪

You can test the API using:

1. **Postman** - Download from [postman.com](https://www.postman.com/)
2. **Thunder Client** - VS Code extension
3. **curl** - Command line tool
4. **Browser** - For GET requests only

### Example with curl:

```bash
# Create a member
curl -X POST http://localhost:3000/api/members \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Smith",
    "email": "jane@example.com",
    "phone": "555-1234",
    "age": 30,
    "membershipType": "Basic"
  }'

# Get all members
curl http://localhost:3000/api/members
```

## Easter Egg 🎉

Try creating a member with the name **"Gym Master"** (case insensitive) and see what happens! The member will automatically receive VIP status and a special welcome message.

## Deployment 🌐

### Option 1: Deploy to Vercel (Recommended)

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Update `config/config.js` with your production MongoDB connection string

### Option 2: Deploy to Heroku

1. Install Heroku CLI
2. Run `heroku create your-app-name`
3. Update `config/config.js` with your production MongoDB connection string
4. Deploy: `git push heroku main`

### Option 3: Deploy to Railway

1. Connect your GitHub repository to Railway
2. Update `config/config.js` with your production MongoDB connection string
3. Deploy automatically

**Note**: For production, make sure to update the `MONGODB_URI` in `config/config.js` with your production database connection string.

## Member Schema 📝

Each member has the following fields:

- `name` (String, required) - Member's full name
- `email` (String, required, unique) - Email address
- `phone` (String, required) - Phone number
- `age` (Number, required) - Age (16-100)
- `membershipType` (String, required) - "Basic", "Premium", or "VIP"
- `joinDate` (Date) - Automatically set when created
- `isActive` (Boolean) - Default: true
- `fitnessGoals` (String, optional) - Member's fitness goals

## Error Handling ⚠️

The API returns appropriate error messages for:
- Validation errors (400)
- Not found errors (404)
- Server errors (500)
- Duplicate email errors (400)

## Technologies Used 🛠️

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database
- **Mongoose** - MongoDB object modeling
- **dotenv** - Environment variable management

## Learning Resources 📚

This project is designed for beginners. Key concepts demonstrated:

- RESTful API design
- MVC (Model-View-Controller) architecture
- Database connections
- Input validation
- Error handling
- Environment variables
- Middleware usage

## Troubleshooting 🔧

**Problem**: Cannot connect to MongoDB
- **Solution**: Check your `MONGODB_URI` in `config/config.js` file
- Make sure your IP is whitelisted in MongoDB Atlas
- Verify your username and password are correct
- Ensure the connection string is wrapped in quotes

**Problem**: Port already in use
- **Solution**: Change `PORT` in `config/config.js` file to a different number (e.g., 3001)

**Problem**: Module not found errors
- **Solution**: Run `npm install` again

## Sources 🗃️

This project was created as a learning exercise for web development beginners. The code includes detailed comments to help understand each part of the application.

## License 📄

This project is open source and available for educational purposes.
