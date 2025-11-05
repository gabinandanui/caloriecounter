// src/pages/FoodTracker.jsx
import React, { useState, useRef } from "react";
import { foodDataByKey } from "../../foodData";
import AutoCompleteComponent from "../components/AutoCompleteComponent";
import TextField from "@mui/material/TextField";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import TodayHistory from "./TodayHistory";

const FoodTracker = () => {
  /* snackbar definition*/
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarMsg, setSnackBarMsg] = useState("");

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar(false);
  };

  /* Food traking */
  const foodQuantityRef = useRef(null);
  const [foodItem, setfoodItem] = useState("");
  const [measurement, setMeasurement] = useState("");
  const [measurementDisable, setMeasurementDisable] = useState(true);
  const [quantityDisable, setquantityDisable] = useState(true);

  /* Food selection handler */
  const handleFoodSelection = (data) => {
    setfoodItem(data);
    setMeasurement(null);
    setMeasurementDisable(data === null ? true : false);
    setquantityDisable(
      data === null || data === "" || measurement === "" || measurement === null
        ? true
        : false
    );
  };
  /* Food measurement selection */
  const handleMeasurementSelection = (data) => {
    setMeasurement(data);
    setquantityDisable(data === null || data === "" ? true : false);
  };
  
  /* dropdown reset */
  function resetDropdowns() {
    // setfoodItem("");
    // setMeasurement("");
    // foodQuantityRef.current.value = "";
    // setMeasurementDisable(true);
    // setquantityDisable(true);
  }
  /* Intake histroy*/
  const [intakeHistory, setIntakeHistory] = useState([]);
  const nutrientCalculator = (foodName, measurement, quantity, nutrient) => {
    let nutrientValue = 0;
    // Added optional chaining (?) in case foodName is null
    foodDataByKey[foodName]?.measurements.forEach((e) => {
      if (e.measurement === measurement) {
        nutrientValue = e[nutrient];
      }
    });
    return nutrientValue * (quantity || 0); // Default to 0 if quantity is bad
  };
  /* Form submission handler*/
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formJsone = Object.fromEntries(formData.entries());
    /* Validating form data */
    if (
      formJsone.measurement === null ||
      formJsone.quantity === null ||
      formJsone.quantity === "" ||
      formJsone.measurement === "" ||
      Number(formJsone.quantity) === 0 ||
      Number(formJsone.quantity) <= 0 ||
      foodItem === null ||
      foodItem === "" ||
      formJsone.measurement === undefined ||
      formJsone.quantity === undefined ||
      foodItem === undefined
    ) {
      setSnackBar(true);
      setSnackBarMsg("Please enter a valid quantity and measurement");
      return;
    } else {
      // 1. Get today's date as a consistent string key (e.g., "2025-11-04")
      // This is the key for our "Daily Log" document
      const todayDateString = new Date().toISOString().split("T")[0];

      // 2. Create the new food entry object
      // We use a full timestamp here for the specific item
      const newFoodEntry = {
        id: Date.now(),
        quantity: formJsone.quantity,
        measurement: formJsone.measurement,
        food_name: foodItem,
        timestamp: new Date(),
        nutrition: {
          calories: nutrientCalculator(
            foodItem,
            formJsone.measurement,
            formJsone.quantity,
            "calories"
          ),
          protein: nutrientCalculator(
            foodItem,
            formJsone.measurement,
            formJsone.quantity,
            "protein"
          ),
          carbs: nutrientCalculator(
            foodItem,
            formJsone.measurement,
            formJsone.quantity,
            "carbs"
          ),
          fats: nutrientCalculator(
            foodItem,
            formJsone.measurement,
            formJsone.quantity,
            "fats"
          ),
          fiber: nutrientCalculator(
            foodItem,
            formJsone.measurement,
            formJsone.quantity,
            "fiber"
          ),
        },
      };

      // 3. Get history from localStorage
      const foodHistoryKey = `intakeFoodHistory_${"abinandang"}`;
      const savedFoodHistory = localStorage.getItem(foodHistoryKey);
      let updatedHistory = []; // This will be our array of DailyLog objects

      if (savedFoodHistory && savedFoodHistory !== "[]") {
        // Parse the saved history (which is an array of Daily Logs)
        updatedHistory = JSON.parse(savedFoodHistory);
      }

      // 4. Find today's log entry
      let todayLog = updatedHistory.find((log) => log.date === todayDateString);

      if (todayLog) {
        // 5a. If today's log exists, add the new food to its foodEntries array
        todayLog.foodEntries.push(newFoodEntry);
        resetDropdowns();
      } else {
        // 5b. If not, create a new daily log for today
        const newDailyLog = {
          userId: "abinandang",
          date: todayDateString,
          foodEntries: [newFoodEntry],
          waterEntries: [], // Ready for when you add water tracking
        };
        updatedHistory.push(newDailyLog);
        resetDropdowns();
      }

      // 6. Update React state AND save back to localStorage
      setIntakeHistory(updatedHistory);
      localStorage.setItem(foodHistoryKey, JSON.stringify(updatedHistory)); // <-- This is the new, crucial part

      // 7. Show snackbar notification
      setSnackBar(true);
      setSnackBarMsg(
        `${formJsone.quantity} ${formJsone.measurement} of ${foodItem} added it is of ${newFoodEntry.nutrition.calories} calories`
      );
      console.log("Added new food entry:", newFoodEntry);
    }
  };
  return (
    <div className="flex flex-col text-white text-left">
      <Snackbar
        open={snackBar}
        autoHideDuration={6000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert onClose={handleClose} severity="success" sx={{ width: "100%" }}>
          {snackBarMsg}
        </Alert>
      </Snackbar>
      <h2 className="text-white text-left font-semibold">Food Tracker</h2>
      <p className="text-white text-left font-semibold">
        Add food to track your intake
      </p>
      <div className="flex flex-col md:flex-row gap-4 tracker-layout">
        <div className="flex-1 mt-5">
          <form id="foodForm" onSubmit={handleSubmit}>
            <AutoCompleteComponent
              optionsList={Object.keys(foodDataByKey)}
              label={"Select Food Item"}
              handleSelect={handleFoodSelection}
              value={foodItem}
              name={"foodItem"}
            />
            <AutoCompleteComponent
              optionsList={(foodDataByKey[foodItem]?.measurements || []).map(
                (e) => {
                  return e.measurement;
                }
              )}
              handleSelect={handleMeasurementSelection}
              value={measurement}
              measurementDisable={measurementDisable}
              label={"Select Measurement"}
              name={"measurement"}
            />

            <Card
              variant="outlined"
              sx={{
                minWidth: 275,
                borderRadius: 4,
                borderLeft: "4px solid #2196f3",
                background: "rgba(29, 78, 216, 0.15)",
                marginTop: "20px",
              }}
            >
              <CardContent className="flex flex-col">
                <h2 className="text-white">Select Quantity</h2>
                <TextField
                  variant="outlined"
                  type="number"
                  name="quantity"
                  inputRef={foodQuantityRef}
                  disabled={quantityDisable}
                  sx={{
                    // Target the text inside the input field
                    "& .MuiInputBase-input": {
                      color: "white",
                    },
                    "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#747474", // Your desired disabled color
                      },
                    "& .MuiFormLabel-root.Mui-disabled": {
                      color: "#747474", // Your desired disabled color
                    },
                    // Target the label text
                    "& .MuiInputLabel-root": {
                      color: "#aab4c2", // A lighter grey for the label
                    },
                    // Target the label text when focused
                    "& .MuiInputLabel-root.Mui-focused": {
                      color: "#2196f3", // Blue color on focus
                    },
                    // Target the border of the input
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "rgba(33, 150, 243, 0.5)",
                      },
                    // Change border on hover
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#2196f3",
                      },
                    // Change border when focused
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#2196f3",
                      },
                  }}
                />
              </CardContent>
            </Card>
            <Button
            variant="contained"
            sx={{
              borderRadius: "12px",
              fontSize: "12px",
              padding: "4px 12px",
              marginTop: "10px",
            }}
            type="submit"
          >
            Submit{" "}
          </Button>
          </form>
        </div>
        <div className="flex-1 mt-5">
          <TodayHistory intakeHistory={intakeHistory}/>
        </div>
      </div>
    </div>
  );
};

export default FoodTracker;
