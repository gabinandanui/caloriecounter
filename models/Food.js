import { ObjectId } from 'mongodb';
import connectDB from '../config/db.js';

class Food {
  constructor(name, calories, protein, carbs, fat) {
    this.name = name;
    this.calories = calories;
    this.protein = protein;
    this.carbs = carbs;
    this.fat = fat;
    this.createdAt = new Date();
  }

  static async getCollection() {
    const db = await connectDB();
    return db.collection('foods');
  }

  async save() {
    const collection = await Food.getCollection();
    const result = await collection.insertOne(this);
    return result;
  }

  static async findAll() {
    const collection = await Food.getCollection();
    return collection.find({}).toArray();
  }

  static async findById(id) {
    const collection = await Food.getCollection();
    return collection.findOne({ _id: new ObjectId(id) });
  }

  static async updateById(id, updatedFields) {
    const collection = await Food.getCollection();
    const result = await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedFields }
    );
    return result;
  }

  static async deleteById(id) {
    const collection = await Food.getCollection();
    const result = await collection.deleteOne({ _id: new ObjectId(id) });
    return result;
  }
}

export default Food;
