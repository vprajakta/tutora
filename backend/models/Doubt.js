import mongoose from "mongoose";

const doubtSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    lectureId: {
      type: String, // From your `lectureSchema`
      required: false, // Optional: doubt may be general
    },
    studentId: {
      type: String,
      ref: "User",
      required: true,
    },
    educatorId: {
      type: String,
      ref: "User",
      required: true,
    },
    queryTitle: {
      type: String,
      required: true,
    },
    queryDetails: {
      type: String,
      required: true,
    },
    isResolved: {
      type: Boolean,
      default: false,
    },
    scheduledTime: {
      type: Date,
    },
    videoRoomId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const Doubt = mongoose.model("Doubt", doubtSchema);
export default Doubt;
