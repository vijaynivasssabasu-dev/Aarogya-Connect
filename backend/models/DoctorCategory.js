import mongoose from "mongoose";

const doctorCategorySchema = new mongoose.Schema({
  categoryName: { type: String, required: true, unique: true }, // Cardiology, Dermatology...
});

export default mongoose.model("DoctorCategory", doctorCategorySchema);
