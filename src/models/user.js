import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: { 
        type: String, 
        required: true, 
        unique: true, 
        trim: true 
    },
    email: { 
        type: String, 
        required: true, 
        unique: true, 
        lowercase: true 
    },
    password: { 
        type: String, 
        required: true 
    },
    profile: {
        avatar: String,
        bio: String,
        skills: [String],
        github: String,
        linkedin: String
    },
    // Solve stats tracking
    solvedProblems: [{
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        status: { type: String, enum: ['Solved', 'Attempted'], default: 'Attempted' },
        solvedAt: { type: Date, default: Date.now }
    }],
    rank: { 
        type: Number, 
        default: 0 
    },
    coins: { 
        type: Number, 
        default: 0 
    }
}, { timestamps: true });

const User = mongoose.model("User", userSchema);
export default User;