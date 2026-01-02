// Database connection configuration
// This file handles the connection to MongoDB Atlas

const { MongoClient, ServerApiVersion } = require("mongodb");
const mongoose = require("mongoose");
const config = require("./config");

/**
 * Connect to MongoDB Atlas database using MongoClient
 * This function establishes a connection to the cloud database
 * If connection fails, the server will continue with dummy data
 */
const connectDB = async () => {
	const uri = config.MONGODB_URI;

	// Create a MongoClient with a MongoClientOptions object to set the Stable API version
	const client = new MongoClient(uri, {
		serverApi: {
			version: ServerApiVersion.v1,
			strict: true,
			deprecationErrors: true,
		},
	});

	try {
		// Connect the client to the server (optional starting in v4.7)
		await client.connect();
		// Send a ping to confirm a successful connection
		await client.db("admin").command({ ping: 1 });
		console.log(
			"Pinged your deployment. You successfully connected to MongoDB!"
		);

		// Also connect Mongoose for model operations
		// Add database name to the URI for Mongoose connection
		const mongooseUri = uri.replace(
			"/?appName=",
			"/gym-db?retryWrites=true&w=majority&appName="
		);
		await mongoose.connect(mongooseUri, {
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		console.log(` MongoDB Connected: ${client.options.srvHost}`);
		console.log(` Database: gym-db`);
		return true; // Connection successful
	} catch (error) {
		// If connection fails, log the error but don't exit - use dummy data instead
		console.error(" MongoDB connection error:", error.message);
		console.log(" Using dummy data mode - API will work with in-memory data");
		return false; // Connection failed, will use dummy data
	} finally {
		// Note: We don't close the client here as we need it for the application
		// The connection will remain open for the lifetime of the application
	}
};

module.exports = connectDB;
