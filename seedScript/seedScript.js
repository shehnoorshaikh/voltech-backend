import mongoose from "mongoose";
import Service from "../models/Service.js";
import { electData } from "../seedData/electData.js";
import { techData } from "../seedData/techData.js";

mongoose.connect(
  "mongodb+srv://shehnoorshaikh:shehnoor2308@voltech.monqyrg.mongodb.net/Voltech",
);

const formatFlatData = (data, category) => {
  let services = [];

  data.forEach((s) => {
    services.push({
      category: category,
      title: s.title,
      description: s.description,
      price: s.price,
      img: s.img,
      rating: s.rating,
      duration: s.duration,
      type: s.type,
      isPopular: s.isPopular,
    });
  });
  return services;
};

const seedData = async () => {
  try {
    await Service.deleteMany({});
    const allData = [
      ...formatFlatData(electData, "electrician"),
      ...formatFlatData(techData, "technician"),
    ];
    await Service.insertMany(allData);

    console.log("all category services inserted successfully");
    process.exit();
  } catch (error) {
    console.log(error);
    process.exit(2);
  }
};

seedData();
