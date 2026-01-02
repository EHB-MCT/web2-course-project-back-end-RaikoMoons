// Database connection configuration
// This file handles the connection to MongoDB Atlas

const mongoose = require("mongoose");
const config = require("./config");

/**
 * Connect to MongoDB Atlas database
 * This function establishes a connection to the cloud database
 * Uses Mongoose ODM which provides schema validation and easier data modeling
 */
const connectDB = async () => {
	try {
		// Connect to MongoDB using the connection string from config file
		const conn = await mongoose.connect(config.MONGODB_URI, {
			// These options help with connection stability
			useNewUrlParser: true,
			useUnifiedTopology: true,
		});

		// Send a ping to confirm a successful connection
		await mongoose.connection.db.admin().command({ ping: 1 });

		// Log success message with connection details
		console.log(
			" Pinged your deployment. You successfully connected to MongoDB!"
		);
		console.log(` MongoDB Connected: ${conn.connection.host}`);
		console.log(` Database: ${conn.connection.name}`);
	} catch (error) {
		// If connection fails, log the error and exit the application
		console.error(" MongoDB connection error:", error.message);
		process.exit(1); // Exit with failure code
	}
};

module.exports = connectDB;
