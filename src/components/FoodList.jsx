import React, { useState, useEffect } from 'react';

const FoodList = () => {
  const [foods, setFoods] = useState([]);

  useEffect(() => {
    const fetchFoods = async () => {
      try {
        const response = await fetch('http://localhost:3001/api/foods');
        const data = await response.json();
        setFoods(data);
      } catch (error) {
        console.error('Error fetching food data:', error);
      }
    };

    fetchFoods();
  }, []);

  return (
    <div>
      <h2>Food List</h2>
      <ul>
        {foods.map((food) => (
          <li key={food._id}>
            {food.name} - {food.calories} calories
          </li>
        ))}
      </ul>
    </div>
  );
};

export default FoodList;
