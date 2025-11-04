// src/data/foodData.js
const foodDataArray  = [
  {
    id: 1,
    name: "Roti/Chapati",
    category: "Breads",
    measurements: [
      {
        measurement: "piece",
        type: "measurement",
        calories: 102,
        protein: 3.6,
        carbs: 18,
        fats: 1.2,
        fiber: 2.5,
      },
    ],
  },
  {
    id: 2,
    name: "Steamed Rice",
    category: "Rice",
    measurements: [
      {
        measurement: "katori",
        type: "volume",
        calories: 205,
        protein: 4.2,
        carbs: 45,
        fats: 0.5,
        fiber: 0.6,
      },
      {
        measurement: "cup",
        type: "volume",
        calories: 273,
        protein: 5.6,
        carbs: 60,
        fats: 0.7,
        fiber: 0.8,
      },
      {
        measurement: "grams",
        type: "weight",
        caloriesPerGram: 1.37,
        proteinPerGram: 0.028,
        carbsPerGram: 0.3,
        fatsPerGram: 0.0035,
        fiberPerGram: 0.004,
      },
    ],
  },
  {
    id: 3,
    name: "Dal Tadka",
    category: "Lentils",
    measurements: [
      {
        measurement: "katori",
        type: "volume",
        calories: 150,
        protein: 7,
        carbs: 20,
        fats: 5,
        fiber: 3,
      },
      {
        measurement: "cup",
        type: "volume",
        calories: 200,
        protein: 9.3,
        carbs: 26.7,
        fats: 6.7,
        fiber: 4,
      },
      {
        measurement: "grams",
        type: "weight",
        caloriesPerGram: 1.0,
        proteinPerGram: 0.047,
        carbsPerGram: 0.133,
        fatsPerGram: 0.033,
        fiberPerGram: 0.02,
      },
    ],
  },
  {
    id: 4,
    name: "Milk (Full Fat)",
    category: "Beverages",
    measurements: [
      {
        measurement: "cup (240ml)",
        type: "volume",
        calories: 149,
        protein: 8,
        carbs: 12,
        fats: 8,
        fiber: 0,
      },
      {
        measurement: "glass (200ml)",
        type: "volume",
        calories: 124,
        protein: 6.7,
        carbs: 10,
        fats: 6.7,
        fiber: 0,
      },
      {
        measurement: "ml",
        type: "volume",
        caloriesPerMl: 0.62,
        proteinPerMl: 0.033,
        carbsPerMl: 0.05,
        fatsPerMl: 0.033,
        fiberPerMl: 0,
      },
    ],
  },
  {
    id: 5,
    name: "Plain Dosa",
    category: "South Indian",
    measurements: [
      {
        measurement: "piece",
        type: "measurement",
        calories: 168,
        protein: 4.1,
        carbs: 33,
        fats: 2.6,
        fiber: 1.4,
      },
    ],
  },
  {
    id: 6,
    name: "Idli",
    category: "South Indian",
    measurements: [
      {
        measurement: "piece",
        type: "measurement",
        calories: 58,
        protein: 2.1,
        carbs: 12,
        fats: 0.2,
        fiber: 0.8,
      },
    ],
  },
  {
    id: 7,
    name: "Samosa",
    category: "Snacks",
    measurements: [
      {
        measurement: "piece",
        type: "measurement",
        calories: 252,
        protein: 4.8,
        carbs: 28,
        fats: 13.5,
        fiber: 2.2,
      },
    ],
  },
  {
    id: 8,
    name: "Chicken Curry",
    category: "Non-Vegetarian",
    measurements: [
      {
        measurement: "katori",
        type: "volume",
        calories: 185,
        protein: 22,
        carbs: 8,
        fats: 8,
        fiber: 1.5,
      },
      {
        measurement: "grams",
        type: "weight",
        caloriesPerGram: 1.23,
        proteinPerGram: 0.147,
        carbsPerGram: 0.053,
        fatsPerGram: 0.053,
        fiberPerGram: 0.01,
      },
    ],
  },
  {
    id: 9,
    name: "Hot Tea",
    category: "Beverages",
    measurements: [
      {
        measurement: "cup (240ml)",
        type: "volume",
        calories: 39,
        protein: 0.9,
        carbs: 6.2,
        fats: 1.3,
        fiber: 0,
      },
      {
        measurement: "ml",
        type: "volume",
        caloriesPerMl: 0.161,
        proteinPerMl: 0.004,
        carbsPerMl: 0.026,
        fatsPerMl: 0.005,
        fiberPerMl: 0,
      },
    ],
  },
  {
    id: 10,
    name: "Aloo Sabji",
    category: "Vegetables",
    measurements: [
      {
        measurement: "katori",
        type: "volume",
        calories: 132,
        protein: 2.8,
        carbs: 18,
        fats: 6,
        fiber: 2.4,
      },
      {
        measurement: "grams",
        type: "weight",
        caloriesPerGram: 0.88,
        proteinPerGram: 0.019,
        carbsPerGram: 0.12,
        fatsPerGram: 0.04,
        fiberPerGram: 0.016,
      },
    ],
  },
];
const createFoodKey = (name) => {
  return name.toLowerCase().replace(/[\s/]/g, '_');
};

// Use reduce to transform the array into an object with food names as keys
export const foodDataByKey = foodDataArray.reduce((acc, foodItem) => {
  const key = createFoodKey(foodItem.name);
  acc[key] = foodItem;
  return acc;
}, {});
export const foodData = foodDataArray;
export const categories = [
  "All",
  "Breads",
  "Rice",
  "Lentils",
  "Beverages",
  "South Indian",
  "Snacks",
  "Non-Vegetarian",
  "Vegetables",
];