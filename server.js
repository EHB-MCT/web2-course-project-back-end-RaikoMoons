const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

const connectDB = require("./config/database");
const config = require("./config/config");

const app = express();

app.use(cors());
app.use(express.json());

// -----------------------------------------------------------------------------
// GYM MODEL
// -----------------------------------------------------------------------------
const reviewSchema = new mongoose.Schema(
	{
		rating: {
			type: Number,
			min: [1, "Rating must be at least 1"],
			max: [5, "Rating cannot exceed 5"],
		},
		comment: {
			type: String,
			trim: true,
			maxlength: [500, "Comment cannot exceed 500 characters"],
		},
	},
	{ _id: false }
);

const gymSchema = new mongoose.Schema(
	{
		Name: {
			type: String,
			required: [true, "Please provide a gym name"],
			trim: true,
			minlength: [2, "Gym name must be at least 2 characters long"],
			maxlength: [100, "Gym name cannot exceed 100 characters"],
		},
		Brand: {
			type: String,
			required: [true, "Please provide a brand name"],
			trim: true,
			maxlength: [50, "Brand name cannot exceed 50 characters"],
		},
		Equipment: {
			type: [String],
			required: [true, "Please provide at least one equipment item"],
			validate: {
				validator(value) {
					return Array.isArray(value) && value.length > 0;
				},
				message: "Please provide at least one equipment item",
			},
		},
		Size: {
			type: String,
			required: [true, "Please provide gym size"],
			enum: {
				values: ["klein", "middelgroot", "groot"],
				message: "Size must be klein, middelgroot, or groot",
			},
		},
		HasShower: {
			type: Boolean,
			default: false,
		},
		Distance: {
			type: Number,
			min: [0, "Distance cannot be negative"],
			default: 0,
		},
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
		Reviews: {
			type: [reviewSchema],
			default: [],
		},
	},
	{ timestamps: true }
);

// Hidden assignment easter egg in API validation.
// Creating/updating a gym named "Gym Master" unlocks premium properties.
gymSchema.pre("validate", function gymMasterEasterEgg(next) {
	if (this.Name?.trim().toLowerCase() === "gym master") {
		this.Size = "groot";
		this.HasShower = true;

		if (!this.Equipment?.length) {
			this.Equipment = [
				"Premium Chest Press",
				"Premium Treadmill",
				"Premium Rowing Machine",
			];
		}
	}

	next();
});

const Gym = mongoose.models.Gym || mongoose.model("Gym", gymSchema);

function withAverageRating(gym) {
	const object = gym.toObject ? gym.toObject() : gym;
	const reviews = object.Reviews || [];
	const averageRating = reviews.length
		? reviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) /
		  reviews.length
		: 0;

	return {
		...object,
		averageRating: Number(averageRating.toFixed(1)),
	};
}

function validationResponse(error, res) {
	if (error.name === "ValidationError") {
		return res.status(400).json({
			success: false,
			error: "Validation Error",
			messages: Object.values(error.errors).map((item) => item.message),
		});
	}

	if (error.name === "CastError") {
		return res.status(400).json({
			success: false,
			error: "Invalid gym ID",
		});
	}

	console.error(error);
	return res.status(500).json({
		success: false,
		error: "Server Error",
		message: error.message,
	});
}

// -----------------------------------------------------------------------------
// API ROUTES
// -----------------------------------------------------------------------------
app.get("/", (req, res) => {
	res.json({
		success: true,
		message: "GymSpot API is running",
		endpoints: [
			"GET /Gyms",
			"GET /Gyms/:id",
			"POST /Gyms",
			"PUT /Gyms/:id",
			"DELETE /Gyms/:id",
		],
	});
});

// READ all gyms
app.get("/Gyms", async (req, res) => {
	try {
		const query = {};

		if (req.query.size) query.Size = req.query.size;
		if (req.query.brand) query.Brand = new RegExp(req.query.brand, "i");
		if (req.query.filterBy === "Showers") query.HasShower = true;
		if (req.query.equipmentType) {
			query.Equipment = { $in: [new RegExp(req.query.equipmentType, "i")] };
		}

		let gyms = await Gym.find(query).sort({ Name: 1 });
		let result = gyms.map(withAverageRating);

		if (req.query.sortBy === "rating") {
			result.sort((a, b) => b.averageRating - a.averageRating);
		} else if (["distance", "afstand"].includes(req.query.sortBy)) {
			result.sort((a, b) => Number(a.Distance || 0) - Number(b.Distance || 0));
		} else if (["size", "grootte"].includes(req.query.sortBy)) {
			const order = { klein: 1, middelgroot: 2, groot: 3 };
			result.sort((a, b) => (order[a.Size] || 0) - (order[b.Size] || 0));
		}

		res.json({ success: true, count: result.length, data: result });
	} catch (error) {
		validationResponse(error, res);
	}
});

// READ one gym
app.get("/Gyms/:id", async (req, res) => {
	try {
		const gym = await Gym.findById(req.params.id);

		if (!gym) {
			return res.status(404).json({ success: false, error: "Gym not found" });
		}

		return res.json({ success: true, data: withAverageRating(gym) });
	} catch (error) {
		return validationResponse(error, res);
	}
});

// CREATE a gym
app.post("/Gyms", async (req, res) => {
	try {
		const gym = new Gym(req.body);
		await gym.save();

		return res.status(201).json({
			success: true,
			message: "Gym created successfully",
			data: withAverageRating(gym),
		});
	} catch (error) {
		return validationResponse(error, res);
	}
});

// UPDATE a gym
// We load + save instead of findByIdAndUpdate so schema validation and the easter egg run.
app.put("/Gyms/:id", async (req, res) => {
	try {
		const gym = await Gym.findById(req.params.id);

		if (!gym) {
			return res.status(404).json({ success: false, error: "Gym not found" });
		}

		const editableFields = [
			"Name",
			"Brand",
			"Equipment",
			"Size",
			"HasShower",
			"Distance",
			"Coordinates",
		];

		editableFields.forEach((field) => {
			if (req.body[field] !== undefined) gym[field] = req.body[field];
		});

		await gym.save();

		return res.json({
			success: true,
			message: "Gym updated successfully",
			data: withAverageRating(gym),
		});
	} catch (error) {
		return validationResponse(error, res);
	}
});

// DELETE a gym
app.delete("/Gyms/:id", async (req, res) => {
	try {
		const gym = await Gym.findByIdAndDelete(req.params.id);

		if (!gym) {
			return res.status(404).json({ success: false, error: "Gym not found" });
		}

		return res.json({
			success: true,
			message: "Gym deleted successfully",
			data: {},
		});
	} catch (error) {
		return validationResponse(error, res);
	}
});

async function startServer() {
	await connectDB();

	app.listen(config.PORT, () => {
		console.log(`GymSpot API running on http://localhost:${config.PORT}`);
	});
}

startServer();
