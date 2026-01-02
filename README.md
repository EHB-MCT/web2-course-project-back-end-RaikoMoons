# Gym Review API - Belgium

A beginner-friendly REST API for reviewing and comparing gyms across Belgium, built with Node.js, Express, and MongoDB Atlas. This API provides full CRUD (Create, Read, Update, Delete) functionality for gym management and user reviews.

## Features

- Full CRUD operations for gyms and users
- User review system for gyms
- Favorite gyms functionality
- Filtering and sorting capabilities
- MongoDB Atlas cloud database integration (with dummy data fallback)
- Input validation and error handling
- RESTful API design
- Beginner-friendly code with detailed comments
- Interactive HTML documentation page
- **Easter Egg**: Try creating a gym with the name "Gym Master"!

## Project Structure

```
gym-api/
├── config/
│   ├── config.js            # Configuration file with MongoDB connection
│   └── database.js          # MongoDB connection configuration
├── public/
│   └── index.html           # Interactive API documentation
├── server.js                 # Main application (all code in one file)
└── package.json              # Project dependencies
```

## Prerequisites

Before you begin, make sure you have:

- Node.js installed (version 14 or higher)
- npm (Node Package Manager) installed
- A MongoDB Atlas account (optional - API works with dummy data if not configured)
- A code editor (VS Code recommended)

## Setup Instructions

### Step 1: Install Dependencies

Open your terminal in the project folder and run:

```bash
npm install
```

This will install all required packages:

- `express` - Web framework for Node.js
- `mongoose` - MongoDB object modeling
- `mongodb` - MongoDB native driver
- `cors` - Cross-Origin Resource Sharing
- `nodemon` - Auto-restart server during development

### Step 2: Configure Database Connection (Optional)

The API works with dummy data by default, so database setup is optional. If you want to use MongoDB Atlas:

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
   - Copy the connection string

6. Update `config/config.js` with your connection string:

```javascript
MONGODB_URI: "mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@YOUR_CLUSTER.mongodb.net/?appName=Clusterraikoehb";
```

**Note**: If the database connection fails, the API will automatically use dummy data and continue working.

### Step 3: Run the Server

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
Server is running on port 3000
API available at http://localhost:3000
API documentation: http://localhost:3000/
```

If MongoDB is connected, you'll also see:

```
Pinged your deployment. You successfully connected to MongoDB!
MongoDB Connected: ...
Database: gym-db
```

If not connected, you'll see:

```
MongoDB connection error: ...
Using dummy data mode - API will work with in-memory data
Server running in dummy data mode
```

## API Endpoints

### Base URL

```
http://localhost:3000
```

### Gym Endpoints

| Method | Endpoint            | Description                               |
| ------ | ------------------- | ----------------------------------------- |
| GET    | `/Gyms`             | Get all gyms (with filtering and sorting) |
| GET    | `/Gyms/:id`         | Get a single gym by ID                    |
| POST   | `/Gyms`             | Create a new gym                          |
| PUT    | `/Gyms/:id`         | Update a gym                              |
| DELETE | `/Gyms/:id`         | Delete a gym                              |
| POST   | `/Gyms/:id/reviews` | Add a review to a gym                     |

### User Endpoints

| Method | Endpoint               | Description                   |
| ------ | ---------------------- | ----------------------------- |
| GET    | `/Users`               | Get all users                 |
| GET    | `/Users/:id`           | Get a single user by ID       |
| POST   | `/Users`               | Create a new user account     |
| PUT    | `/Users/:id`           | Update a user                 |
| DELETE | `/Users/:id`           | Delete a user                 |
| POST   | `/Users/:id/favorites` | Add a gym to user's favorites |

### Query Parameters for GET /Gyms

- `sortBy` - Sort results: `rating`, `distance` (or `afstand`), `size` (or `grootte`)
- `filterBy` - Filter by: `Showers` (gyms with showers)
- `brand` - Filter by brand name (case-insensitive)
- `size` - Filter by size: `klein`, `middelgroot`, `groot`
- `equipmentType` - Filter by equipment type (case-insensitive)

### Example Requests

#### Get All Gyms

```bash
GET http://localhost:3000/Gyms
```

#### Get Gyms with Filters

```bash
GET http://localhost:3000/Gyms?sortBy=rating&filterBy=Showers&brand=Basic-Fit
```

#### Create a Gym

```bash
POST http://localhost:3000/Gyms
Content-Type: application/json

{
  "Name": "Basic-Fit Brussel",
  "Brand": "Basic-Fit",
  "Equipment": ["Loopband", "Chest Press", "Roeimachine"],
  "Size": "middelgroot",
  "HasShower": true,
  "Distance": 2.5,
  "Coordinates": {
    "lat": 50.8503,
    "lng": 4.3517
  },
  "Reviews": []
}
```

#### Create a User

```bash
POST http://localhost:3000/Users
Content-Type: application/json

{
  "Name": "Jan Peeters",
  "Email": "jan.peeters@gmail.com",
  "Password": "securepassword123",
  "Age": 25,
  "Gender": "man",
  "Location": "Brussel"
}
```

#### Add a Review to a Gym

```bash
POST http://localhost:3000/Gyms/GYM_ID/reviews
Content-Type: application/json

{
  "userId": "USER_ID",
  "rating": 4,
  "comment": "Goede sfeer en moderne apparatuur!"
}
```

## Testing the API

### Interactive Documentation

Visit `http://localhost:3000/` in your browser to access the interactive API documentation page with:

- Complete endpoint documentation
- Code examples
- Test buttons to try the API
- Schema information

### Using Tools

You can also test the API using:

1. **Postman** - Download from [postman.com](https://www.postman.com/)
2. **Thunder Client** - VS Code extension
3. **curl** - Command line tool
4. **Browser** - For GET requests only

### Example with curl:

```bash
# Get all gyms
curl http://localhost:3000/Gyms

# Create a gym
curl -X POST http://localhost:3000/Gyms \
  -H "Content-Type: application/json" \
  -d '{
    "Name": "Test Gym",
    "Brand": "Test Brand",
    "Equipment": ["Loopband", "Chest Press"],
    "Size": "middelgroot",
    "HasShower": true,
    "Distance": 1.5,
    "Coordinates": {
      "lat": 50.8503,
      "lng": 4.3517
    },
    "Reviews": []
  }'

# Get all users
curl http://localhost:3000/Users
```

## Data Schemas

### Gym Schema

Each gym has the following fields:

- `Name` (String, required) - Name of the gym (e.g., "Basic-Fit Brussel")
- `Brand` (String, required) - Brand name (e.g., "Basic-Fit", "Jims")
- `Equipment` (Array of Strings, required) - Available equipment (e.g., ["Loopband", "Chest Press"])
- `Size` (String, required) - Size: "klein", "middelgroot", or "groot"
- `HasShower` (Boolean) - Whether the gym has showers (default: false)
- `Distance` (Number) - Distance to user in kilometers
- `Coordinates` (Object, required) - Latitude and longitude: `{lat: number, lng: number}`
- `Reviews` (Array) - User reviews array

### User Schema

Each user has the following fields:

- `Name` (String, required) - User's full name
- `Email` (String, required, unique) - Email address
- `Password` (String, required) - Password (minimum 6 characters)
- `Age` (Number, required) - Age (13-120)
- `Gender` (String, required) - "man", "vrouw", or "anders"
- `Location` (String, required) - City or region (e.g., "Brussel")
- `FavoriteGyms` (Array) - Array of gym IDs
- `Reviews` (Array) - Reviews posted by this user

## Easter Egg

Try creating a gym with the name **"Gym Master"** (case insensitive)! It will automatically:

- Get upgraded to "groot" size
- Receive premium equipment
- Have showers enabled

## Dummy Data

The API includes dummy data that works immediately without a database connection:

- **4 Sample Gyms**: Basic-Fit Brussel, Jims Antwerpen, David Lloyd Gent, Basic-Fit Leuven
- **2 Sample Users**: Jan Peeters, Marie Dubois

You can test all endpoints right away! If you connect to MongoDB Atlas, the API will automatically switch to database mode.

## Error Handling

The API returns appropriate error messages for:

- Validation errors (400)
- Not found errors (404)
- Server errors (500)
- Duplicate email errors (400)
- Invalid ID format errors (400)

## Technologies Used

- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB Atlas** - Cloud database (optional)
- **Mongoose** - MongoDB object modeling
- **MongoDB Native Driver** - Direct MongoDB connection

## Learning Resources

This project is designed for beginners. Key concepts demonstrated:

- RESTful API design
- Database connections with fallback
- Input validation
- Error handling
- In-memory data storage
- Filtering and sorting
- User authentication concepts
- Review and rating systems

## Troubleshooting

**Problem**: Cannot connect to MongoDB

- **Solution**: The API will automatically use dummy data. Check your `MONGODB_URI` in `config/config.js` if you want to use the database. Make sure your IP is whitelisted in MongoDB Atlas.

**Problem**: Port already in use

- **Solution**: Change `PORT` in `config/config.js` file to a different number (e.g., 3001)

**Problem**: Module not found errors

- **Solution**: Run `npm install` again

**Problem**: API not working

- **Solution**: The API works with dummy data by default. Make sure the server is running with `npm start` or `npm run dev`. Check the console for any error messages.

## Deployment

### Option 1: Deploy to Vercel

1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in your project directory
3. Follow the prompts
4. Update `config/config.js` with your production MongoDB connection string (optional)

### Option 2: Deploy to Heroku

1. Install Heroku CLI
2. Run `heroku create your-app-name`
3. Update `config/config.js` with your production MongoDB connection string (optional)
4. Deploy: `git push heroku main`

### Option 3: Deploy to Railway

1. Connect your GitHub repository to Railway
2. Update `config/config.js` with your production MongoDB connection string (optional)
3. Deploy automatically

**Note**: The API works with dummy data, so MongoDB is optional. For production, you may want to set up MongoDB Atlas for persistent data storage.

## Sources

This project was created as a learning exercise for web development beginners. The code includes detailed comments to help understand each part of the application.

## License

This project is open source and available for educational purposes.
