import React, { useState, useRef, useEffect } from "react";
import { foodDataByKey } from "../../foodData";
import AutoCompleteComponent from "../components/AutoCompleteComponent";
import { TextField, Card, CardContent, Button, Container } from "@mui/material";
import TodayHistory from "./TodayHistory";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import CalorieChart from "./CalorieChart";
import { CircularProgress, Alert } from "@mui/material";

const FoodTracker = ({ targetCalouries, setSnackBar, setSnackBarMsg, user }) => {
  /* Food traking */
  const foodQuantityRef = useRef(null);
  const [foodItem, setfoodItem] = useState(null); // Use null for AutoComplete
  const [measurement, setMeasurement] = useState(null); // Use null for AutoComplete
  const [measurementDisable, setMeasurementDisable] = useState(true);
  const [quantityDisable, setquantityDisable] = useState(true);
  const [todayData, setTodayData] = useState([]);
  const [totalCalories, setTotalCalories] = useState(0);
  // AI Tips State (can be string fallback or structured object returned by server)
  const [aiTips, setAiTips] = useState(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);
  
  /* Intake histroy*/
  const [intakeHistory, setIntakeHistory] = useState([]);
  const foodHistoryKey = `intakeFoodHistory_${user.uid}`; // Define key once

  // --- FIX 1: LOAD HISTORY FROM LOCALSTORAGE ON MOUNT ---
  useEffect(() => {
    const savedFoodHistory = localStorage.getItem(foodHistoryKey);
    if (savedFoodHistory && savedFoodHistory !== "[]") {
      setIntakeHistory(JSON.parse(savedFoodHistory));
    }
  }, []); // Empty dependency array means this runs once on mount

  /* Food selection handler */
  const handleFoodSelection = (data) => {
    setfoodItem(data);
    setMeasurement(null);
    setMeasurementDisable(data === null ? true : false);
    setquantityDisable(true); // Always disable quantity when food changes
  };

  /* Food measurement selection */
  const handleMeasurementSelection = (data) => {
    setMeasurement(data);
    setquantityDisable(data === null || data === "" ? true : false);
  };

  /* dropdown reset */
  // --- FIX 2: UNCOMMENT AND FIX FORM RESET LOGIC ---
  function resetDropdowns() {
    setfoodItem(null); // Set to null to clear AutoComplete
    setMeasurement(null); // Set to null to clear AutoComplete
    if (foodQuantityRef.current) {
        foodQuantityRef.current.value = "";
    }
    setMeasurementDisable(true);
    setquantityDisable(true);
  }

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
      // 1. Get today's date
      const todayDateString = dayjs().format("YYYY-MM-DD");

      // 2. Create the new food entry object
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
      // We read from localStorage *first* to avoid race conditions
      const savedFoodHistory = localStorage.getItem(foodHistoryKey);
      let updatedHistory = []; 

      if (savedFoodHistory && savedFoodHistory !== "[]") {
        updatedHistory = JSON.parse(savedFoodHistory);
      }

      // 4. Find today's log entry
      let todayLog = updatedHistory.find((log) => log.date === todayDateString);

      if (todayLog) {
        // 5a. If today's log exists, add the new food
        todayLog.foodEntries.push(newFoodEntry);
      } else {
        // 5b. If not, create a new daily log for today
        const newDailyLog = {
          userId: user.uid,
          date: todayDateString,
          foodEntries: [newFoodEntry],
          waterEntries: [], 
        };
        updatedHistory.push(newDailyLog);
      }

      // 6. Update React state AND save back to localStorage
      setIntakeHistory(updatedHistory);
      localStorage.setItem(foodHistoryKey, JSON.stringify(updatedHistory)); 
      
      // 7. Reset form and show notification
      resetDropdowns(); // <-- This will now work
      setSnackBar(true);
      setSnackBarMsg(
        `${formJsone.quantity} ${formJsone.measurement} of ${foodItem} added it is of ${newFoodEntry.nutrition.calories} calories`
      );
      console.log("Added new food entry:", newFoodEntry);
    }
  };

  const handleAnalyzeFood = async () => {
  setAiTips(null);
    setAiError(null);
    setIsAiLoading(true);

    try {
      const foodEntries = todayData[0]?.foodEntries;
      if (!foodEntries || foodEntries.length === 0) {
        setAiError("No food data available for today to analyze.");
        setIsAiLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3001/api/analyzeFoodIntake', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ foodData: foodEntries }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI tips.');
      }

  const data = await response.json();
  // Server returns either a parsed JSON object or a fallback { suggestions: text }
  setAiTips(data);
    } catch (error) {
      setAiError(error.message);
    } finally {
      setIsAiLoading(false);
    }
  };
  
  /* Date picker */
  const [datePicker, setdatePicker] = React.useState(dayjs());
  
  useEffect(() => {
    const filterTodayDate = intakeHistory.filter(
      (item) =>
        dayjs(item.date).format("YYYY-MM-DD") ===
        dayjs(datePicker).format("YYYY-MM-DD")
    );
    setTodayData(filterTodayDate);
  }, [datePicker, intakeHistory]);

  useEffect(() => {
    if (todayData && todayData.length > 0 && todayData[0].foodEntries) {
      const total = todayData[0].foodEntries
        .flatMap((item) => item.nutrition.calories)
        .reduce((acc, calories) => acc + calories, 0);
      setTotalCalories(total);
    } else {
      setTotalCalories(0);
    }
  }, [todayData]);


  return (
    <Container>
      <div className="flex flex-col text-white text-left mt-5">
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
            <div className="text-center mt-4">
            </div>
          </div>
          <div className="flex-1 mt-5">
            <h2>Select Date</h2>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                defaultValue={dayjs()}
                onChange={(newValue) => setdatePicker(newValue)}
                value={datePicker}
                slotProps={{
                  textField: {
                    sx: {
                      // Target the text inside the input field
                      "& .MuiInputBase-input": {
                        color: "white",
                      },
                      "& .MuiSvgIcon-root": {
                        color: "white",
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
                      "& .MuiPickersSectionList-root.MuiPickersInputBase-sectionsContainer":
                        {
                          color: "white",
                        },
                      "& .MuiPickersInputBase-root": {
                        border: "1px solid white",
                      },
                    },
                  },
                }}
              />
            </LocalizationProvider>
            <TodayHistory
              intakeHistory={intakeHistory}
              setIntakeHistory={setIntakeHistory}
              todayData={todayData}
            />
            <div className="flex-1 mt-5">
              <CalorieChart
                targetCalouries={targetCalouries}
                totalCalories={totalCalories}
              />
              <Button
                variant="contained"
                color="primary"
                onClick={handleAnalyzeFood}
                disabled={isAiLoading}
                sx={{ mt: 2 }}
              >
                {isAiLoading ? <CircularProgress size={24} /> : "Get AI Tips"}
              </Button>
              {/* If there's no data for the selected date, show an explanatory hint */}
              {(!todayData || todayData.length === 0) && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  No food entries found for the selected date. Add a food item and try again.
                </Alert>
              )}
              {aiError && <Alert severity="error" sx={{ mt: 2 }}>{aiError}</Alert>}
              {aiTips && (
                <Card sx={{ mt: 2, p: 2, background: "rgba(29, 78, 216, 0.15)", color: "white" }}>
                  {/* If server returned fallback text */}
                  {aiTips.suggestions && typeof aiTips.suggestions === 'string' && (
                    <div style={{ whiteSpace: 'pre-wrap' }}>{aiTips.suggestions}</div>
                  )}

                  {/* If server returned structured JSON */}
                  {!aiTips.suggestions && (
                    <div>
                      {aiTips.summary && <p style={{ fontWeight: 600 }}>{aiTips.summary}</p>}
                      {aiTips.fixes && Array.isArray(aiTips.fixes) && (
                        <ul style={{ marginTop: 8, marginBottom: 8 }}>
                          {aiTips.fixes.map((fix, idx) => (
                            <li key={idx} style={{ marginBottom: 6 }}>{fix}</li>
                          ))}
                        </ul>
                      )}
                      {aiTips.sample_meal && (
                        <p style={{ marginTop: 6 }}><strong>Sample:</strong> {aiTips.sample_meal}</p>
                      )}
                      {aiTips.ui_line && (
                        <p style={{ marginTop: 6, opacity: 0.9 }}>{aiTips.ui_line}</p>
                      )}
                    </div>
                  )}
                </Card>
              )}
              <h2 className="text-center">
                Target:{targetCalouries} Consumed: {totalCalories}
              </h2>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default FoodTracker;