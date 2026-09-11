const dns = require("dns");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Task = require("./models/Task");

// Configure public DNS to resolve MongoDB Atlas SRV records properly on Windows
try {
  dns.setServers(["8.8.8.8", "1.1.1.1"]);
} catch (e) {
  // Ignore if not supported in environment
}

// Load environment variables from .env
dotenv.config();

const sampleTasks = [
  {
    title: "Learn Next.js App Router",
    description:
      "Understand file-based routing, root layouts, server and client components in Next.js.",
    completed: true,
  },
  {
    title: "Set Up Express REST API",
    description:
      "Build modular Express route handlers for GET, POST, PATCH, and DELETE operations.",
    completed: true,
  },
  {
    title: "Connect MongoDB with Mongoose",
    description:
      "Define the Task schema, configure Mongoose connection pooling, and handle connection errors.",
    completed: false,
  },
  {
    title: "Test Task CRUD Flow",
    description:
      "Verify creating new tasks, marking them completed, editing details, and deleting from the dashboard.",
    completed: false,
  },
  {
    title: "Implement Status Filtering",
    description:
      "Filter tasks on the dashboard across All, Active, and Completed categories.",
    completed: false,
  },
];

async function seedDatabase() {
  const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/task-manager";

  try {
    console.log(`[Seed] Connecting to MongoDB: ${uri}`);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log("[Seed] Connected to MongoDB successfully.");

    // Clear existing tasks
    const deleted = await Task.deleteMany({});
    console.log(`[Seed] Cleared ${deleted.deletedCount} existing tasks.`);

    // Insert sample tasks
    const createdTasks = await Task.insertMany(sampleTasks);
    console.log(`[Seed] Successfully inserted ${createdTasks.length} sample tasks:`);
    createdTasks.forEach((t, index) => {
      console.log(`  ${index + 1}. [${t.completed ? "✓" : " "}] ${t.title} (ID: ${t._id})`);
    });

    console.log("\n[Seed] Database seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error(`\n[Seed] Error seeding database: ${error.message}`);
    if (error.message.includes("ECONNREFUSED")) {
      console.error(
        "\n👉 Tip: MongoDB is not currently running locally on 127.0.0.1:27017." +
        "\n   If you are using MongoDB Atlas (cloud), update MONGODB_URI in your .env file with your Atlas connection string and run 'npm run seed' again."
      );
    }
    process.exit(1);
  }
}

seedDatabase();
