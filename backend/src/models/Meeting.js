import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    meetingCode: {
      type: String,
      required: true,
      unique: true,
    },

    status: {
      type: String,
      enum: ["Scheduled", "Live", "Completed"],
      default: "Scheduled",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Meeting", meetingSchema);
