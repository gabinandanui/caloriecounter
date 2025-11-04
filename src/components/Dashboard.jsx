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
    setquantityDisable((data === null) || (data === "") || (measurement === "" || measurement === null) ? true : false);
  };
  /* Food measurement selection */
  const handleMeasurementSelection = (data) => {
    setMeasurement(data);
    setquantityDisable((data === null) || (data === "") ? true : false);

  };

  /* Intake histroy*/
  const [intakeHistory, setIntakeHistory] = useState([]);
  const nutrientCalculator = (foodName, measurement, quantity, nutrient) => {
    debugger
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
    if (formJsone.measurement === null || formJsone.quantity === null || formJsone.quantity === "" || formJsone.measurement === "" || Number(formJsone.quantity) === 0 || Number(formJsone.quantity) <= 0) {
      setSnackBar(true);
      setSnackBarMsg('Please enter a valid quantity and measurement');
      return;
    }
    else {
      /* if valid data create a data structure */
      const todayDateString = new Date().toISOString().split('T')[0];
      console.log(formJsone);
      const newFoodEntry = {
        id: Date.now(),
        quantity: formJsone.quantity,
        measurement: formJsone.measurement,
        food_name: foodItem,
        food_type: 'fooditem',
        timestamp: new Date(), // Use full ISO Date for *when* it was added
        food_info: {icon: '🍽️'},
        nutrition: {
          calories: nutrientCalculator(foodItem, formJsone.measurement, formJsone.quantity, "calories"),
          protein: nutrientCalculator(foodItem, formJsone.measurement, formJsone.quantity, "protein"),
          carbs: nutrientCalculator(foodItem, formJsone.measurement, formJsone.quantity, "carbs"),
          fats: nutrientCalculator(foodItem, formJsone.measurement, formJsone.quantity, "fats"),
          fiber: nutrientCalculator(foodItem, formJsone.measurement, formJsone.quantity, "fiber"),
        }
      };
      console.log(newFoodEntry);
      
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
          <Alert
            onClose={handleClose}
            severity="success"
            sx={{ width: "100%" }}
          >
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
              optionsList={
                (foodDataByKey[foodItem]?.measurements || []).map((e) => {
                  return e.measurement;
                })
              }
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
                    "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
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
            {/* <Button
            variant="contained"
            sx={{
              borderRadius: "12px",
              fontSize: "12px",
              padding: "4px 12px",
              marginTop: "10px",
            }}
            onClick={() => {
              handleIntakeFoodAnalyzed({
                food_name: foodItem,
                measurement,
                quantity: foodQuantityRef.current.value,
              });
            }}
          >
            Submit{" "}
          </Button> */}
            <Button variant="contained" type="submit">
              Calculate
            </Button>
          </form>
        </div>
        <div className="flex-1 mt-5">
        </div>
      </div>
    </div>
  );
};

export default FoodTracker;