import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import Hospital from "../models/Hospital.js";
import DoctorCategory from "../models/DoctorCategory.js";
import Admin from "../models/Admin.js";
import Doctor from "../models/Doctor.js";
import Patient from "../models/Patient.js";
import Receptionist from "../models/Receptionist.js";

dotenv.config();

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected to MongoDB for seeding...");
  await Promise.all([Hospital.deleteMany({}), DoctorCategory.deleteMany({}), Admin.deleteMany({}), Doctor.deleteMany({}), Patient.deleteMany({}), Receptionist.deleteMany({})]);
  const passwordHash = await bcrypt.hash("password123", 10);
  const hospitals = await Hospital.insertMany([
    { name: "City General Hospital", city: "Hyderabad", address: "Road No. 1, Banjara Hills", phone: "+914023456789" },
    { name: "Apollo Health Center", city: "Hyderabad", address: "Jubilee Hills", phone: "+914034567890" },
    { name: "Care Hospitals", city: "Hyderabad", address: "Hitech City", phone: "+914045678901" },
  ]);
  const categories = await DoctorCategory.insertMany([
    { categoryName: "Cardiology" }, { categoryName: "Dermatology" }, { categoryName: "Orthopedics" },
    { categoryName: "Pediatrics" }, { categoryName: "General Medicine" }, { categoryName: "Neurology" },
    { categoryName: "Ophthalmology" }, { categoryName: "ENT" },
  ]);
  await Admin.create({ name: "System Admin", email: "admin@healthcare.com", passwordHash, phone: "+919999999999", isSuperAdmin: true });
  await Doctor.insertMany([
    { name: "Dr. Rajesh Kumar", email: "rajesh@healthcare.com", passwordHash, phone: "+919876543210", hospital: hospitals[0]._id, category: categories[0]._id },
    { name: "Dr. Priya Sharma", email: "priya@healthcare.com", passwordHash, phone: "+919876543211", hospital: hospitals[0]._id, category: categories[1]._id },
    { name: "Dr. Amit Patel", email: "amit@healthcare.com", passwordHash, phone: "+919876543212", hospital: hospitals[1]._id, category: categories[2]._id },
    { name: "Dr. Sneha Reddy", email: "sneha@healthcare.com", passwordHash, phone: "+919876543213", hospital: hospitals[1]._id, category: categories[3]._id },
    { name: "Dr. Vikram Singh", email: "vikram@healthcare.com", passwordHash, phone: "+919876543214", hospital: hospitals[2]._id, category: categories[4]._id },
  ]);
  await Patient.insertMany([
    { name: "Ravi Teja", email: "ravi@example.com", phone: "+919123456789", passwordHash, dob: new Date("1990-05-15"), gender: "Male", bloodGroup: "O+", address: "Hyderabad" },
    { name: "Ananya Iyer", email: "ananya@example.com", phone: "+919123456790", passwordHash, dob: new Date("1985-08-22"), gender: "Female", bloodGroup: "A+", address: "Hyderabad" },
  ]);
  await Receptionist.insertMany([
    { name: "Meena Kumari", email: "meena@healthcare.com", passwordHash, phone: "+919876000001", hospital: hospitals[0]._id },
    { name: "Suresh Babu", email: "suresh@healthcare.com", passwordHash, phone: "+919876000002", hospital: hospitals[1]._id },
  ]);
  console.log("Seed data inserted successfully!");
  console.log("\nDemo credentials (all use password: password123):");
  console.log("Admin: admin@healthcare.com");
  console.log("Doctor: rajesh@healthcare.com");
  console.log("Patient: ravi@example.com");
  console.log("Receptionist: meena@healthcare.com");
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => { console.error("Seed failed:", err); process.exit(1); });
