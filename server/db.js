import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    
    passwordHash: {
      type: String,
    },
    // Track how the user signed up
    authProvider: {
      type: String,
      enum: ["local", "github"],
      default: "local",
    },
    // Optional: Store their GitHub unique ID for safer lookups
    githubId: {
      type: String,
      unique: true,
      sparse: true, // Allows multiple users to have 'null' githubId (for local users)
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
