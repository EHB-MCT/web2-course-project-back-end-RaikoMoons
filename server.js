// Main Server File
// This is the entry point of our application

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

// Import database connection (kept separate as requested)
const connectDB = require("./config/database");

// Import config
const config = require("./config/config");

// CONFIGURATION
const PORT = config.PORT;
const NODE_ENV = config.NODE_ENV;

// ============================================================================
// DUMMY DATA STORAGE (In-memory fallback)
// ============================================================================
let useDummyData = false;
let dummyGyms = [];
let dummyUsers = [];
let gymIdCounter = 1;
let userIdCounter = 1;

// Initialize dummy data
function initializeDummyData() {
	// Dummy Users
	dummyUsers = [
		{
			_id: "user1",
			Name: "Jan Peeters",
			Email: "jan.peeters@gmail.com",
			Password: "password123",
			Age: 25,
			Gender: "man",
			Location: "Brussel",
			FavoriteGyms: [],
			Reviews: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			_id: "user2",
			Name: "Marie Dubois",
			Email: "marie.dubois@gmail.com",
			Password: "password123",
			Age: 30,
			Gender: "vrouw",
			Location: "Antwerpen",
			FavoriteGyms: [],
			Reviews: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	// Dummy Gyms
	dummyGyms = [
		{
			_id: "gym1",
			Name: "Basic-Fit Brussel Centrum",
			Brand: "Basic-Fit",
			Equipment: ["Loopband", "Chest Press", "Roeimachine", "Dumbbells"],
			Size: "middelgroot",
			HasShower: true,
			Distance: 2.5,
			Coordinates: {
				lat: 50.8503,
				lng: 4.3517,
			},
			Reviews: [
				{
					userId: "user1",
					rating: 4,
					comment: "Goede sfeer en moderne apparatuur!",
					createdAt: new Date(),
				},
			],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			_id: "gym2",
			Name: "Jims Antwerpen",
			Brand: "Jims",
			Equipment: ["Loopband", "Leg Press", "Pull-up Bar", "Kettlebells"],
			Size: "groot",
			HasShower: true,
			Distance: 1.2,
			Coordinates: {
				lat: 51.2194,
				lng: 4.4025,
			},
			Reviews: [
				{
					userId: "user2",
					rating: 5,
					comment: "Uitstekende faciliteiten!",
					createdAt: new Date(),
				},
			],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			_id: "gym3",
			Name: "David Lloyd Gent",
			Brand: "David Lloyd",
			Equipment: ["Loopband", "Chest Press", "Swimming Pool", "Spa"],
			Size: "groot",
			HasShower: true,
			Distance: 3.8,
			Coordinates: {
				lat: 51.0543,
				lng: 3.7174,
			},
			Reviews: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			_id: "gym4",
			Name: "Basic-Fit Leuven",
			Brand: "Basic-Fit",
			Equipment: ["Loopband", "Chest Press"],
			Size: "klein",
			HasShower: false,
			Distance: 5.0,
			Coordinates: {
				lat: 50.8798,
				lng: 4.7005,
			},
			Reviews: [],
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	gymIdCounter = 5;
	userIdCounter = 3;
	console.log("Dummy data initialized!");
}

// GYM MODEL
/**
 * Gym Schema
 * Defines what information we store about each gym in Belgium
 */
const gymSchema = new mongoose.Schema(
	{
		// Name of the gym (e.g., Basic-Fit Brussel, Jims Antwerpen)
		Name: {
			type: String,
			required: [true, "Please provide a gym name"],
			trim: true,
			minlength: [2, "Gym name must be at least 2 characters long"],
			maxlength: [100, "Gym name cannot exceed 100 characters"],
		},

		// Available equipment or facilities (array of strings)
		Equipment: {
			type: [String],
			required: [true, "Please provide at least one equipment item"],
			validate: {
				validator: function (v) {
					return v && v.length > 0;
				},
				message: "Please provide at least one equipment item",
			},
		},

		// User reviews (array of review objects)
		Reviews: [
			{
				userId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "User",
				},
				rating: {
					type: Number,
					required: true,
					min: [1, "Rating must be at least 1"],
					max: [5, "Rating cannot exceed 5"],
				},
				comment: {
					type: String,
					trim: true,
					maxlength: [500, "Comment cannot exceed 500 characters"],
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],

		// Distance to user (in km)
		Distance: {
			type: Number,
			min: [0, "Distance cannot be negative"],
		},

		// Size of the gym
		Size: {
			type: String,
			required: [true, "Please provide gym size"],
			enum: {
				values: ["klein", "middelgroot", "groot"],
				message: "Size must be klein, middelgroot, or groot",
			},
		},

		// Whether the gym has showers
		HasShower: {
			type: Boolean,
			default: false,
		},

		// Brand name of the gym chain
		Brand: {
			type: String,
			required: [true, "Please provide a brand name"],
			trim: true,
			maxlength: [50, "Brand name cannot exceed 50 characters"],
		},

		// Coordinates for Google Maps display
		Coordinates: {
			lat: {
				type: Number,
				required: [true, "Please provide latitude"],
				min: [-90, "Latitude must be between -90 and 90"],
				max: [90, "Latitude must be between -90 and 90"],
			},
			lng: {
				type: Number,
				required: [true, "Please provide longitude"],
				min: [-180, "Longitude must be between -180 and 180"],
				max: [180, "Longitude must be between -180 and 180"],
			},
		},
	},
	{
		// Automatically add createdAt and updatedAt fields
		timestamps: true,
	}
);

/**
 * EASTER EGG: Special validation for gyms named "Gym Master"
 * If someone tries to create a gym with the name "Gym Master" (case insensitive),
 * it automatically gets special features!
 */
gymSchema.pre("save", function (next) {
	// Check if the name is "Gym Master" (case insensitive)
	if (this.Name && this.Name.toLowerCase().trim() === "gym master") {
		// Automatically set to groot size
		this.Size = "groot";
		// Automatically add premium equipment
		if (!this.Equipment || this.Equipment.length === 0) {
			this.Equipment = [
				"Premium Chest Press",
				"Premium Loopband",
				"Premium Roeimachine",
			];
		}
		// Automatically enable showers
		this.HasShower = true;
		console.log(
			"EASTER EGG ACTIVATED: Gym Master detected! Premium features granted!"
		);
	}
	next();
});

// Create the Gym model
const Gym = mongoose.model("Gym", gymSchema);

// ============================================================================
// USER MODEL
// ============================================================================
/**
 * User Schema
 * Defines what information we store about users who review gyms
 */
const userSchema = new mongoose.Schema(
	{
		// User's name
		Name: {
			type: String,
			required: [true, "Please provide a name"],
			trim: true,
			minlength: [2, "Name must be at least 2 characters long"],
			maxlength: [50, "Name cannot exceed 50 characters"],
		},

		// Email address (must be unique)
		Email: {
			type: String,
			required: [true, "Please provide an email address"],
			unique: true,
			trim: true,
			lowercase: true,
			match: [
				/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
				"Please provide a valid email address",
			],
		},

		// Password (should be encrypted in production, but for beginner level we'll store as string)
		Password: {
			type: String,
			required: [true, "Please provide a password"],
			minlength: [6, "Password must be at least 6 characters long"],
		},

		// Age of the user
		Age: {
			type: Number,
			required: [true, "Please provide an age"],
			min: [13, "Users must be at least 13 years old"],
			max: [120, "Please provide a valid age"],
		},

		// Gender
		Gender: {
			type: String,
			required: [true, "Please provide a gender"],
			enum: {
				values: ["man", "vrouw", "anders"],
				message: "Gender must be man, vrouw, or anders",
			},
		},

		// Location (city or region)
		Location: {
			type: String,
			required: [true, "Please provide a location"],
			trim: true,
			maxlength: [100, "Location cannot exceed 100 characters"],
		},

		// Favorite gyms (array of gym IDs)
		FavoriteGyms: [
			{
				type: mongoose.Schema.Types.ObjectId,
				ref: "Gym",
			},
		],

		// Reviews posted by this user
		Reviews: [
			{
				gymId: {
					type: mongoose.Schema.Types.ObjectId,
					ref: "Gym",
				},
				rating: {
					type: Number,
					required: true,
					min: [1, "Rating must be at least 1"],
					max: [5, "Rating cannot exceed 5"],
				},
				comment: {
					type: String,
					trim: true,
					maxlength: [500, "Comment cannot exceed 500 characters"],
				},
				createdAt: {
					type: Date,
					default: Date.now,
				},
			},
		],
	},
	{
		// Automatically add createdAt and updatedAt fields
		timestamps: true,
	}
);

// Create the User model
const User = mongoose.model("User", userSchema);

// ============================================================================
// CONTROLLER FUNCTIONS - GYMS
// ============================================================================

/**
 * GET /Gyms
 * Get all gyms with optional sorting and filtering
 * Parameters: sortBy, filterBy
 */
const getAllGyms = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			let results = [...dummyGyms];

			// Filter by HasShower
			if (req.query.filterBy === "Showers") {
				results = results.filter((gym) => gym.HasShower === true);
			}

			// Filter by Brand
			if (req.query.brand) {
				const brandRegex = new RegExp(req.query.brand, "i");
				results = results.filter((gym) => brandRegex.test(gym.Brand));
			}

			// Filter by Size
			if (req.query.size) {
				results = results.filter((gym) => gym.Size === req.query.size);
			}

			// Filter by equipment type
			if (req.query.equipmentType) {
				const eqRegex = new RegExp(req.query.equipmentType, "i");
				results = results.filter((gym) =>
					gym.Equipment.some((eq) => eqRegex.test(eq))
				);
			}

			// Calculate average rating
			let gymsWithRating = results.map((gym) => {
				const gymObj = { ...gym };
				if (gym.Reviews && gym.Reviews.length > 0) {
					const avgRating =
						gym.Reviews.reduce((sum, review) => sum + review.rating, 0) /
						gym.Reviews.length;
					gymObj.averageRating = parseFloat(avgRating.toFixed(2));
				} else {
					gymObj.averageRating = 0;
				}
				return gymObj;
			});

			// Sort by rating
			if (req.query.sortBy === "rating") {
				gymsWithRating = gymsWithRating.sort(
					(a, b) => b.averageRating - a.averageRating
				);
			}
			// Sort by distance
			else if (
				req.query.sortBy === "afstand" ||
				req.query.sortBy === "distance"
			) {
				gymsWithRating = gymsWithRating.sort(
					(a, b) => (a.Distance || 0) - (b.Distance || 0)
				);
			}
			// Sort by size
			else if (req.query.sortBy === "grootte" || req.query.sortBy === "size") {
				const sizeOrder = { klein: 1, middelgroot: 2, groot: 3 };
				gymsWithRating = gymsWithRating.sort((a, b) => {
					return (sizeOrder[a.Size] || 0) - (sizeOrder[b.Size] || 0);
				});
			}
			// Default: sort by name
			else {
				gymsWithRating = gymsWithRating.sort((a, b) =>
					a.Name.localeCompare(b.Name)
				);
			}

			return res.status(200).json({
				success: true,
				count: gymsWithRating.length,
				data: gymsWithRating,
			});
		}

		// Database mode
		let query = {};

		// Filter by HasShower
		if (req.query.filterBy === "Showers") {
			query.HasShower = true;
		}

		// Filter by Brand
		if (req.query.brand) {
			query.Brand = new RegExp(req.query.brand, "i");
		}

		// Filter by Size
		if (req.query.size) {
			query.Size = req.query.size;
		}

		// Filter by equipment type
		if (req.query.equipmentType) {
			query.Equipment = { $in: [new RegExp(req.query.equipmentType, "i")] };
		}

		let gymsQuery = Gym.find(query);

		// Sort by distance
		if (req.query.sortBy === "afstand" || req.query.sortBy === "distance") {
			gymsQuery = gymsQuery.sort({ Distance: 1 });
		}
		// Sort by size
		else if (req.query.sortBy === "grootte" || req.query.sortBy === "size") {
			// For size sorting, we'll do it in memory after fetching
			gymsQuery = gymsQuery.sort({ Name: 1 }); // Temporary sort
		}
		// Default: sort by name
		else {
			gymsQuery = gymsQuery.sort({ Name: 1 });
		}

		let results = await gymsQuery;

		// Calculate average rating for each gym
		let gymsWithRating = results.map((gym) => {
			const gymObj = gym.toObject();
			if (gym.Reviews && gym.Reviews.length > 0) {
				const avgRating =
					gym.Reviews.reduce((sum, review) => sum + review.rating, 0) /
					gym.Reviews.length;
				gymObj.averageRating = parseFloat(avgRating.toFixed(2));
			} else {
				gymObj.averageRating = 0;
			}
			return gymObj;
		});

		// Sort by rating if requested (after calculating average rating)
		if (req.query.sortBy === "rating") {
			gymsWithRating = gymsWithRating.sort(
				(a, b) => b.averageRating - a.averageRating
			);
		}
		// Sort by size if requested
		else if (req.query.sortBy === "grootte" || req.query.sortBy === "size") {
			const sizeOrder = { klein: 1, middelgroot: 2, groot: 3 };
			gymsWithRating = gymsWithRating.sort((a, b) => {
				return (sizeOrder[a.Size] || 0) - (sizeOrder[b.Size] || 0);
			});
		}

		res.status(200).json({
			success: true,
			count: gymsWithRating.length,
			data: gymsWithRating,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "Server Error: Could not fetch gyms",
			message: error.message,
		});
	}
};

/**
 * GET /Gyms/:id
 * Get a single gym by its ID
 */
const getGymById = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const gym = dummyGyms.find((g) => g._id === req.params.id);
			if (!gym) {
				return res.status(404).json({
					success: false,
					error: "Gym not found",
				});
			}

			const gymObj = { ...gym };
			if (gym.Reviews && gym.Reviews.length > 0) {
				const avgRating =
					gym.Reviews.reduce((sum, review) => sum + review.rating, 0) /
					gym.Reviews.length;
				gymObj.averageRating = parseFloat(avgRating.toFixed(2));
			} else {
				gymObj.averageRating = 0;
			}

			return res.status(200).json({
				success: true,
				data: gymObj,
			});
		}

		// Database mode
		const gym = await Gym.findById(req.params.id).populate(
			"Reviews.userId",
			"Name Email"
		);

		if (!gym) {
			return res.status(404).json({
				success: false,
				error: "Gym not found",
			});
		}

		// Calculate average rating
		const gymObj = gym.toObject();
		if (gym.Reviews && gym.Reviews.length > 0) {
			const avgRating =
				gym.Reviews.reduce((sum, review) => sum + review.rating, 0) /
				gym.Reviews.length;
			gymObj.averageRating = parseFloat(avgRating.toFixed(2));
		} else {
			gymObj.averageRating = 0;
		}

		res.status(200).json({
			success: true,
			data: gymObj,
		});
	} catch (error) {
		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid gym ID format",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not fetch gym",
			message: error.message,
		});
	}
};

/**
 * POST /Gyms
 * Create a new gym
 */
const createGym = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			// Basic validation
			if (
				!req.body.Name ||
				!req.body.Brand ||
				!req.body.Equipment ||
				!req.body.Size ||
				!req.body.Coordinates
			) {
				return res.status(400).json({
					success: false,
					error: "Validation Error",
					messages: [
						"Please provide Name, Brand, Equipment, Size, and Coordinates",
					],
				});
			}

			// Easter egg check
			if (
				req.body.Name &&
				req.body.Name.toLowerCase().trim() === "gym master"
			) {
				req.body.Size = "groot";
				if (!req.body.Equipment || req.body.Equipment.length === 0) {
					req.body.Equipment = [
						"Premium Chest Press",
						"Premium Loopband",
						"Premium Roeimachine",
					];
				}
				req.body.HasShower = true;
			}

			const newGym = {
				_id: `gym${gymIdCounter++}`,
				Name: req.body.Name,
				Brand: req.body.Brand,
				Equipment: req.body.Equipment,
				Size: req.body.Size,
				HasShower: req.body.HasShower || false,
				Distance: req.body.Distance || 0,
				Coordinates: req.body.Coordinates,
				Reviews: req.body.Reviews || [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			dummyGyms.push(newGym);

			return res.status(201).json({
				success: true,
				message: "Gym created successfully!",
				data: newGym,
			});
		}

		// Database mode
		const gym = await Gym.create(req.body);

		res.status(201).json({
			success: true,
			message: "Gym created successfully!",
			data: gym,
		});
	} catch (error) {
		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				error: "Validation Error",
				messages: messages,
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not create gym",
			message: error.message,
		});
	}
};

/**
 * PUT /Gyms/:id
 * Update an existing gym
 */
const updateGym = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const gymIndex = dummyGyms.findIndex((g) => g._id === req.params.id);
			if (gymIndex === -1) {
				return res.status(404).json({
					success: false,
					error: "Gym not found",
				});
			}

			// Update gym
			dummyGyms[gymIndex] = {
				...dummyGyms[gymIndex],
				...req.body,
				_id: dummyGyms[gymIndex]._id,
				updatedAt: new Date(),
			};

			return res.status(200).json({
				success: true,
				message: "Gym updated successfully!",
				data: dummyGyms[gymIndex],
			});
		}

		// Database mode
		const gym = await Gym.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		});

		if (!gym) {
			return res.status(404).json({
				success: false,
				error: "Gym not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Gym updated successfully!",
			data: gym,
		});
	} catch (error) {
		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				error: "Validation Error",
				messages: messages,
			});
		}

		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid gym ID format",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not update gym",
			message: error.message,
		});
	}
};

/**
 * DELETE /Gyms/:id
 * Delete a gym
 */
const deleteGym = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const gymIndex = dummyGyms.findIndex((g) => g._id === req.params.id);
			if (gymIndex === -1) {
				return res.status(404).json({
					success: false,
					error: "Gym not found",
				});
			}

			dummyGyms.splice(gymIndex, 1);

			return res.status(200).json({
				success: true,
				message: "Gym deleted successfully!",
				data: {},
			});
		}

		// Database mode
		const gym = await Gym.findByIdAndDelete(req.params.id);

		if (!gym) {
			return res.status(404).json({
				success: false,
				error: "Gym not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "Gym deleted successfully!",
			data: {},
		});
	} catch (error) {
		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid gym ID format",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not delete gym",
			message: error.message,
		});
	}
};

/**
 * POST /Gyms/:id/reviews
 * Add a review to a gym
 */
const addReviewToGym = async (req, res) => {
	try {
		const { userId, rating, comment } = req.body;

		if (!userId || !rating) {
			return res.status(400).json({
				success: false,
				error: "Please provide userId and rating",
			});
		}

		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			// Check if user exists
			const user = dummyUsers.find((u) => u._id === userId);
			if (!user) {
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			}

			// Find the gym
			const gymIndex = dummyGyms.findIndex((g) => g._id === req.params.id);
			if (gymIndex === -1) {
				return res.status(404).json({
					success: false,
					error: "Gym not found",
				});
			}

			const gym = dummyGyms[gymIndex];

			// Check if user already reviewed this gym
			const existingReview = gym.Reviews.find(
				(review) => review.userId === userId
			);
			if (existingReview) {
				return res.status(400).json({
					success: false,
					error: "You have already reviewed this gym",
				});
			}

			// Add review to gym
			const newReview = {
				userId: userId,
				rating: rating,
				comment: comment || "",
				createdAt: new Date(),
			};
			gym.Reviews.push(newReview);

			// Add review to user's reviews
			user.Reviews.push({
				gymId: req.params.id,
				rating: rating,
				comment: comment || "",
				createdAt: new Date(),
			});

			return res.status(201).json({
				success: true,
				message: "Review added successfully!",
				data: gym,
			});
		}

		// Database mode
		// Check if user exists
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		// Find the gym
		const gym = await Gym.findById(req.params.id);
		if (!gym) {
			return res.status(404).json({
				success: false,
				error: "Gym not found",
			});
		}

		// Check if user already reviewed this gym
		const existingReview = gym.Reviews.find(
			(review) => review.userId.toString() === userId
		);
		if (existingReview) {
			return res.status(400).json({
				success: false,
				error: "You have already reviewed this gym",
			});
		}

		// Add review to gym
		gym.Reviews.push({
			userId: userId,
			rating: rating,
			comment: comment || "",
		});

		// Add review to user's reviews
		user.Reviews.push({
			gymId: req.params.id,
			rating: rating,
			comment: comment || "",
		});

		await gym.save();
		await user.save();

		res.status(201).json({
			success: true,
			message: "Review added successfully!",
			data: gym,
		});
	} catch (error) {
		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid ID format",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not add review",
			message: error.message,
		});
	}
};

// ============================================================================
// CONTROLLER FUNCTIONS - USERS
// ============================================================================

/**
 * GET /Users
 * Get all users
 */
const getAllUsers = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const users = dummyUsers.map((user) => {
				const userObj = { ...user };
				delete userObj.Password;
				return userObj;
			});

			return res.status(200).json({
				success: true,
				count: users.length,
				data: users,
			});
		}

		// Database mode
		const users = await User.find()
			.select("-Password")
			.populate("FavoriteGyms", "Name Brand")
			.sort({ createdAt: -1 });

		res.status(200).json({
			success: true,
			count: users.length,
			data: users,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			error: "Server Error: Could not fetch users",
			message: error.message,
		});
	}
};

/**
 * GET /Users/:id
 * Get a single user by their ID
 */
const getUserById = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const user = dummyUsers.find((u) => u._id === req.params.id);
			if (!user) {
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			}

			const userObj = { ...user };
			delete userObj.Password;

			// Populate favorite gyms
			userObj.FavoriteGyms = user.FavoriteGyms.map((gymId) => {
				const gym = dummyGyms.find((g) => g._id === gymId);
				return gym ? { _id: gym._id, Name: gym.Name, Brand: gym.Brand } : null;
			}).filter(Boolean);

			// Populate reviews with gym info
			userObj.Reviews = user.Reviews.map((review) => {
				const gym = dummyGyms.find((g) => g._id === review.gymId);
				return {
					...review,
					gymId: gym
						? { _id: gym._id, Name: gym.Name, Brand: gym.Brand }
						: review.gymId,
				};
			});

			return res.status(200).json({
				success: true,
				data: userObj,
			});
		}

		// Database mode
		const user = await User.findById(req.params.id)
			.select("-Password")
			.populate("FavoriteGyms", "Name Brand")
			.populate("Reviews.gymId", "Name Brand");

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			data: user,
		});
	} catch (error) {
		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid user ID format",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not fetch user",
			message: error.message,
		});
	}
};

/**
 * POST /Users
 * Create a new user account
 */
const createUser = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			// Basic validation
			if (
				!req.body.Name ||
				!req.body.Email ||
				!req.body.Password ||
				!req.body.Age ||
				!req.body.Gender ||
				!req.body.Location
			) {
				return res.status(400).json({
					success: false,
					error: "Validation Error",
					messages: [
						"Please provide Name, Email, Password, Age, Gender, and Location",
					],
				});
			}

			// Check if email exists
			if (dummyUsers.some((u) => u.Email === req.body.Email.toLowerCase())) {
				return res.status(400).json({
					success: false,
					error: "Email already exists. Please use a different email address.",
				});
			}

			const newUser = {
				_id: `user${userIdCounter++}`,
				Name: req.body.Name,
				Email: req.body.Email.toLowerCase(),
				Password: req.body.Password,
				Age: req.body.Age,
				Gender: req.body.Gender,
				Location: req.body.Location,
				FavoriteGyms: [],
				Reviews: [],
				createdAt: new Date(),
				updatedAt: new Date(),
			};

			dummyUsers.push(newUser);

			const userObj = { ...newUser };
			delete userObj.Password;

			return res.status(201).json({
				success: true,
				message: "User account created successfully!",
				data: userObj,
			});
		}

		// Database mode
		const user = await User.create(req.body);

		// Don't send password in response
		const userObj = user.toObject();
		delete userObj.Password;

		res.status(201).json({
			success: true,
			message: "User account created successfully!",
			data: userObj,
		});
	} catch (error) {
		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				error: "Validation Error",
				messages: messages,
			});
		}

		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				error: "Email already exists. Please use a different email address.",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not create user",
			message: error.message,
		});
	}
};

/**
 * PUT /Users/:id
 * Update an existing user
 */
const updateUser = async (req, res) => {
	try {
		// Don't allow password updates through this endpoint (should be separate)
		if (req.body.Password) {
			delete req.body.Password;
		}

		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const userIndex = dummyUsers.findIndex((u) => u._id === req.params.id);
			if (userIndex === -1) {
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			}

			// Check email uniqueness if email is being updated
			if (req.body.Email) {
				const emailExists = dummyUsers.some(
					(u, index) =>
						u.Email === req.body.Email.toLowerCase() && index !== userIndex
				);
				if (emailExists) {
					return res.status(400).json({
						success: false,
						error:
							"Email already exists. Please use a different email address.",
					});
				}
			}

			// Update user
			dummyUsers[userIndex] = {
				...dummyUsers[userIndex],
				...req.body,
				_id: dummyUsers[userIndex]._id,
				Email: req.body.Email
					? req.body.Email.toLowerCase()
					: dummyUsers[userIndex].Email,
				updatedAt: new Date(),
			};

			const userObj = { ...dummyUsers[userIndex] };
			delete userObj.Password;

			return res.status(200).json({
				success: true,
				message: "User updated successfully!",
				data: userObj,
			});
		}

		// Database mode
		const user = await User.findByIdAndUpdate(req.params.id, req.body, {
			new: true,
			runValidators: true,
		}).select("-Password");

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "User updated successfully!",
			data: user,
		});
	} catch (error) {
		if (error.name === "ValidationError") {
			const messages = Object.values(error.errors).map((err) => err.message);
			return res.status(400).json({
				success: false,
				error: "Validation Error",
				messages: messages,
			});
		}

		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid user ID format",
			});
		}

		if (error.code === 11000) {
			return res.status(400).json({
				success: false,
				error: "Email already exists. Please use a different email address.",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not update user",
			message: error.message,
		});
	}
};

/**
 * DELETE /Users/:id
 * Delete a user
 */
const deleteUser = async (req, res) => {
	try {
		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const userIndex = dummyUsers.findIndex((u) => u._id === req.params.id);
			if (userIndex === -1) {
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			}

			dummyUsers.splice(userIndex, 1);

			return res.status(200).json({
				success: true,
				message: "User deleted successfully!",
				data: {},
			});
		}

		// Database mode
		const user = await User.findByIdAndDelete(req.params.id);

		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		res.status(200).json({
			success: true,
			message: "User deleted successfully!",
			data: {},
		});
	} catch (error) {
		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid user ID format",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not delete user",
			message: error.message,
		});
	}
};

/**
 * POST /Users/:id/favorites
 * Add a gym to user's favorites
 */
const addFavoriteGym = async (req, res) => {
	try {
		const { gymId } = req.body;

		if (!gymId) {
			return res.status(400).json({
				success: false,
				error: "Please provide gymId",
			});
		}

		// Check if using dummy data
		if (useDummyData || !mongoose.connection.readyState) {
			const userIndex = dummyUsers.findIndex((u) => u._id === req.params.id);
			if (userIndex === -1) {
				return res.status(404).json({
					success: false,
					error: "User not found",
				});
			}

			const user = dummyUsers[userIndex];

			// Check if gym exists
			const gym = dummyGyms.find((g) => g._id === gymId);
			if (!gym) {
				return res.status(404).json({
					success: false,
					error: "Gym not found",
				});
			}

			// Check if already in favorites
			if (user.FavoriteGyms.includes(gymId)) {
				return res.status(400).json({
					success: false,
					error: "Gym is already in favorites",
				});
			}

			user.FavoriteGyms.push(gymId);

			const userObj = { ...user };
			delete userObj.Password;

			return res.status(200).json({
				success: true,
				message: "Gym added to favorites!",
				data: userObj,
			});
		}

		// Database mode
		const user = await User.findById(req.params.id);
		if (!user) {
			return res.status(404).json({
				success: false,
				error: "User not found",
			});
		}

		// Check if gym exists
		const gym = await Gym.findById(gymId);
		if (!gym) {
			return res.status(404).json({
				success: false,
				error: "Gym not found",
			});
		}

		// Check if already in favorites
		if (user.FavoriteGyms.includes(gymId)) {
			return res.status(400).json({
				success: false,
				error: "Gym is already in favorites",
			});
		}

		user.FavoriteGyms.push(gymId);
		await user.save();

		const userObj = user.toObject();
		delete userObj.Password;

		res.status(200).json({
			success: true,
			message: "Gym added to favorites!",
			data: userObj,
		});
	} catch (error) {
		if (error.name === "CastError") {
			return res.status(400).json({
				success: false,
				error: "Invalid ID format",
			});
		}

		res.status(500).json({
			success: false,
			error: "Server Error: Could not add favorite",
			message: error.message,
		});
	}
};

// ============================================================================
// ERROR HANDLER MIDDLEWARE
// ============================================================================
const errorHandler = (err, req, res, next) => {
	let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
	let message = err.message || "Internal Server Error";

	if (NODE_ENV === "development") {
		console.error("Error:", err);
	}

	res.status(statusCode).json({
		success: false,
		error: message,
		...(NODE_ENV === "development" && { stack: err.stack }),
	});
};

// ============================================================================
// EXPRESS APP SETUP
// ============================================================================
const app = express();

// Initialize dummy data immediately (always available as fallback)
initializeDummyData();

// Try to connect to MongoDB Atlas (or use dummy data if connection fails)
connectDB()
	.then((connected) => {
		if (!connected) {
			useDummyData = true;
			console.log("Server running in dummy data mode");
		}
	})
	.catch(() => {
		useDummyData = true;
		console.log("Server running in dummy data mode");
	});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (for index.html)
app.use(express.static(path.join(__dirname, "public")));

// ============================================================================
// ROUTES
// ============================================================================

// Serve index.html at root
app.get("/", (req, res) => {
	res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API Routes for Gyms
app.get("/Gyms", getAllGyms);
app.get("/Gyms/:id", getGymById);
app.post("/Gyms", createGym);
app.put("/Gyms/:id", updateGym);
app.delete("/Gyms/:id", deleteGym);
app.post("/Gyms/:id/reviews", addReviewToGym);

// API Routes for Users
app.get("/Users", getAllUsers);
app.get("/Users/:id", getUserById);
app.post("/Users", createUser);
app.put("/Users/:id", updateUser);
app.delete("/Users/:id", deleteUser);
app.post("/Users/:id/favorites", addFavoriteGym);

// 404 handler
app.use((req, res) => {
	res.status(404).json({
		success: false,
		error: "Route not found",
		message: `The route ${req.method} ${req.path} does not exist`,
	});
});

// Error handler middleware (must be last)
app.use(errorHandler);

// ============================================================================
// START SERVER
// ============================================================================
app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`API available at http://localhost:${PORT}`);
	console.log(`API documentation: http://localhost:${PORT}/`);
});
