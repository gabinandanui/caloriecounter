import React, { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardActions } from "@mui/material";
import dayjs from "dayjs";
import DeleteIcon from "@mui/icons-material/Delete";
import eatingGif from "../assets/eatcat.gif";
const TodayHistory = ({
  intakeHistory,
  setIntakeHistory,
  todayData
}) => {

  const getNutrientIcon = (type) => {
    const normalized = type.toLowerCase();
    if (normalized === "calories") return "🔥";
    if (normalized === "carbs") return "🍞"; // Changed from 'carbohydrates'
    if (normalized === "protein") return "💪";
    if (normalized === "fats") return "🥑"; // Changed from 'fat' to match your data
    if (normalized === "fiber") return "🌾";
    return "🥤";
  };

  useEffect(() => {
    const foodHistoryKey = `intakeFoodHistory_${"abinandang"}`;
    const savedFoodHistory = localStorage.getItem(foodHistoryKey);
    if (savedFoodHistory) {
      const parsedHistory = JSON.parse(savedFoodHistory);
      // Only update intakeHistory if it's different from current
      if (JSON.stringify(parsedHistory) !== JSON.stringify(intakeHistory)) {
        setIntakeHistory(parsedHistory);
      }
      // Filter today's data
    }
  }, []);
  
  function handleDelete(id) {
    const foodHistoryKey = `intakeFoodHistory_${"abinandang"}`;

    // Update state and remove empty days
    setIntakeHistory((currentHistory) => {
      const updatedHistory = currentHistory
        .map((item) => ({
          ...item,
          foodEntries: item.foodEntries.filter((entry) => entry.id !== id),
        }))
        .filter((item) => item.foodEntries.length > 0); // Remove days with no entries

      // Save to localStorage
      localStorage.setItem(foodHistoryKey, JSON.stringify(updatedHistory));

      return updatedHistory;
    });
  }
  return (
    <>
      <Card
        sx={{
          minWidth: 275,
          borderRadius: 4,
          borderLeft: "4px solid #2196f3",
          background: "rgba(29, 78, 216, 0.15)",
          marginTop: "20px",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        <CardContent>
          {todayData && todayData.length > 0 ? (
            <div>
              <h2 className="text-white text-left font-semibold">
                Intake History
              </h2>

              {todayData
                // 1. Use flatMap to create one single array of all food entries
                .flatMap((item) => item.foodEntries)

                // 2. Now sort that flat array. Use new Date() to compare timestamps correctly.
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))

                // 3. Map over the sorted entries. Note it's (foodEntry), not ([foodEntries])
                .map((foodEntries) => (
                  <Card
                    sx={{
                      minWidth: 275,
                      border: "1px solid #2196f3",
                      background: "rgba(29, 78, 216, 0.15)",
                      borderRadius: "8px",
                      padding: "8px",
                      marginTop: "8px",
                    }}
                    key={foodEntries.id}
                  >
                    <span className="text-left flex mr-auto text-white items-center">
                      <span className="animate-pulse mr-2">🍲</span>
                      {foodEntries.quantity} {foodEntries.measurement} of{" "}
                      {foodEntries.food_name} - {foodEntries.nutrition.calories} Cal
                      <span className="ml-auto">
                        {/* [ ['calories',16] ['protein',0.8] ['carbs',2.6] ['fats',0.5] ['fiber',0] ]
                      ↓ filter out zero
                      [ ['calories',16] ['protein',0.8] ['carbs',2.6] ['fats',0.5] ]
                      ↓ map to icons
                      [ 🔥 , 💪 , 🍞 , 🥑 ] */}
                        {foodEntries.nutrition &&
                          Object.entries(foodEntries.nutrition) // 1. Convert object to array: [['calories', 16], ['carbs', 2.6], ...]
                            .filter(([, val]) => val > 0) // 2. Keep only items with value > 0 food_type
                            .map(
                              (
                                [nutrient, val] // 3. Map the filtered array to show icons
                              ) => (
                                <span
                                  key={nutrient}
                                  title={String(val + "g")}
                                  className="mr-2 cursor-pointer"
                                >
                                  {getNutrientIcon(nutrient)}
                                </span>
                              )
                            )}
                      </span>
                    </span>
                    <span className="text-left flex mr-auto text-white">
                      {new Date(foodEntries.timestamp).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      <span className="text-left flex ml-auto text-white">
                        <DeleteIcon
                          color="error"
                          fontSize="small"
                          onClick={() => handleDelete(foodEntries.id)}
                        />
                      </span>
                    </span>
                  </Card>
                ))}
            </div>
          ) : (
            <p className="text-white text-left font-semibold">
              {" "}
              <span className="animate-pulse">
                No intake history available, Eat some food!{" "}
              </span>
              <img
                className="mt-5 mx-auto"
                style={{ width: "240px" }}
                src={eatingGif}
                alt="Empty"
              />
            </p>
          )}
        </CardContent>
        <CardActions></CardActions>
      </Card>
    </>
  );
};

export default TodayHistory;
