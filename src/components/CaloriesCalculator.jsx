import React, { useEffect, useState } from "react";
import {
  Alert,
  Card,
  CardContent,
  CardHeader,
  Container,
  Typography,
  Stack,
  Box,
  TextField,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Button,
  CardActions,
  FormHelperText,
} from "@mui/material";
import deficitVsSurplus from "../assets/deficit-vs-surplus.png";
import bmr from "../assets/bmr.png";
import deficit from "../assets/deficit.png";
import GridInfoCard from "../components/GridInfoCard";
import {
  LocalFireDepartment,
  FitnessCenter,
  Scale,
  DateRange,
  CalendarMonth,
} from "@mui/icons-material";
const CaloriesCalculator = ({ targetCalouries, setTargetCalouries, setSnackBar, setSnackBarMsg}) => {
  const [results, setResults] = useState(null);
  const [errors, setErrors] = useState({});

  const caloriesPerKgFat = 7700;
  const minCal = { male: 1500, female: 1200 };
  const calculateBMR = ({ gender, weight, height, age }) => {
    if (gender === "male") {
      return 10 * weight + 6.25 * height - 5 * age + 5;
    } else {
      return 10 * weight + 6.25 * height - 5 * age - 161;
    }
  };
  const calculateResult = (values) => {
    const bmr = calculateBMR(values);
    const tdee = bmr * values.activityLevel;
    const weeklyDeficit = values.weeklyLossRate * caloriesPerKgFat;
    const dailyTarget = tdee - weeklyDeficit / 7;
    const totalLoss = values.weight - values.targetWeight;
    const weeksToGoal = totalLoss / values.weeklyLossRate;
    return { bmr, tdee, weeklyDeficit, dailyTarget, weeksToGoal };
  };
  const initialValues = {
    gender: "",
    age: "",
    weight: "",
    height: "",
    activityLevel: "",
    targetWeight: "",
    weeklyLossRate: "",
  };
  const [formValues, setFormValues] = useState(initialValues);
  const handleChange = (event) => {
    const { name, value } = event.target;
    if (["weight", "height", "age", "targetWeight"].includes(name)) {
      setFormValues({
        ...formValues,
        [name]: Math.max(0, value) === 0 ? "" : Math.max(0, value),
      });
      Math.max(0, value) === 0 ? null : setErrors({ ...errors, [name]: null });
    } else {
      setErrors({ ...errors, [name]: null });
      setFormValues({ ...formValues, [name]: value });
    }
  };
  const handleTargetUpdate = (targetCalouries) => {
    setTargetCalouries(targetCalouries)
    setSnackBar(true)
    setSnackBarMsg('Target Calories Updated')
    const foodTargetKey = `intakeFoodTarget_${"abinandang"}`;
    localStorage.setItem(foodTargetKey, targetCalouries);
  }
  useEffect(() => {
    const foodTargetKey = `intakeFoodTarget_${"abinandang"}`;
    const savedFoodTarget = localStorage.getItem(foodTargetKey);
    console.log(savedFoodTarget);
    
    if (savedFoodTarget) {
      setTargetCalouries(savedFoodTarget);
    }
  }, []);
  const validateForm = (value) => {
    const validationErrors = {};
    const weight = parseFloat(value.weight);
    const targetWeight = parseFloat(value.targetWeight);
    const activityLevel = parseFloat(value.activityLevel);
    const weeklyLossRate = parseFloat(value.weeklyLossRate);
    const age = parseFloat(value.age);
    const height = parseFloat(value.height);
    if (!value.gender) {
      validationErrors.gender = "Please select a gender";
    }
    if (!age || age < 15 || age > 100) {
      validationErrors.age = "Age must be between 15 and 100";
    }
    if (!weight || weight < 30) {
      validationErrors.weight = "Please enter a valid weight";
    }
    if (!height || height < 120) {
      validationErrors.height = "Please enter a valid height";
    }
    if (!activityLevel || activityLevel === "") {
      validationErrors.activityLevel = "Please Select a activityLevel";
    }
    if (!targetWeight || targetWeight >= weight) {
      validationErrors.targetWeight =
        "Target weight must be less than current weight";
    }
    if (!targetWeight) {
      validationErrors.targetWeight = "Target weight must not be empty";
    }
    if (!weeklyLossRate) {
      validationErrors.weeklyLossRate = "Please select a weekly loss rate";
    }
    if (Object.keys(validationErrors).length === 0) {
      const bmr = calculateBMR(value);
      const tdee = bmr * value.activityLevel;
      const weeklyDeficit = value.weeklyLossRate * caloriesPerKgFat;
      const dailyTarget = tdee - weeklyDeficit / 7;
      if (dailyTarget < minCal[value.gender]) {
        validationErrors.calorieSafety = `Your calculated daily target (${Math.round(
          dailyTarget
        )}) cal) is below safe minimum of ${minCal[value.gender]} cal for ${
          value.gender
        }s. Please reduce your weekly loss rate or increase your target weight.`;
      }
    }
    return validationErrors;
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const form = event.target;
    const formData = new FormData(form);
    const formJsone = Object.fromEntries(formData.entries());
    console.log(formJsone);
    const validateErrors = validateForm(formJsone);
    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
      setResults(null);
      return;
    }
    setErrors({});
    setResults(calculateResult(formJsone));
  };

  const activityLevels = [
    { value: "", label: "Choose an activity level" },
    { value: "1.2", label: "Sedentary (Little or no exercise)" },
    { value: "1.375", label: "Lightly Active (1-3 days/week)" },
    { value: "1.55", label: "Moderately Active (3-5 days/week)" },
    { value: "1.725", label: "Very Active (6-7 days/week)" },
    { value: "1.9", label: "Extra Active (intense daily)" },
  ];
  return (
    <>
      <Container
        maxWidth={false}
        sx={{ py: 4 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(29, 78, 216, 0.15) 0%, rgba(8, 145, 178, 0.15) 100%)",
          width: "calc(100vw - 4px)",
          maxWidth: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          borderRadius: 0,
        }}
      >
        <Typography variant="h2" gutterBottom align="center">
          Understanding Your Metabolism: BMR & TDEE
        </Typography>
        <Typography align="center" color="text.white" mb={4}>
          Learn how your body uses energy and calculate your personalized
          calorie targets for weight loss.
        </Typography>
        <Card sx={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}>
          <CardContent>
            <img src={deficitVsSurplus} alt="Deficit vs Surplus" />
          </CardContent>
        </Card>
      </Container>
      <Container
        maxWidth={false}
        sx={{ py: 4 }}
        style={{
          borderRadius: "12px",
          marginTop: "24px",
          border: "1px solid rgba(119, 124, 124, 0.2)",
        }}
      >
        <Typography variant="h2" gutterBottom align="center">
          Basal Metabolic Rate (BMR)
        </Typography>
        <Typography align="center" color="text.white" mb={4}>
          BMR is the minimum number of calories your body needs at complete rest
          to perform essential life-sustaining functions like breathing,
          circulation, cell production, and maintaining body temperature. It
          accounts for 60-70% of your daily calorie burn.
        </Typography>
        <Card sx={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}>
          <CardContent>
            <img src={bmr} alt="Deficit vs Surplus" />
          </CardContent>
        </Card>
        <h3 className="font-semibold">What BMR Covers:</h3>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <GridInfoCard
            icon="faLungs"
            title=" Breathing & Circulation"
            percentage="60%"
            description="Essential respiratory and cardiovascular functions"
          />
          <GridInfoCard
            icon="faDna"
            title=" Cell Production & Repair"
            percentage="15%"
            description="Cellular regeneration and maintenance"
          />
          <GridInfoCard
            icon="faThermometerHalf"
            title="Body Temperature"
            percentage="10%"
            description="Maintaining optimal internal temperature"
          />
          <GridInfoCard
            icon="faUtensils"
            title="Nutrient Processing"
            percentage="10%"
            description="Basic metabolic processes and enzyme functions"
          />
          <GridInfoCard
            icon="faBrain"
            title="Brain & Nervous System"
            percentage="5%"
            description="Neural activity and brain functions"
          />
        </div>
      </Container>
      <Container
        maxWidth={false}
        sx={{ py: 4 }}
        style={{
          borderRadius: "12px",
          marginTop: "24px",
          border: "1px solid rgba(119, 124, 124, 0.2)",
        }}
      >
        <Typography variant="h2" gutterBottom align="center">
          Total Daily Energy Expenditure (TDEE)
        </Typography>
        <Typography align="center" color="text.white" mb={4}>
          TDEE is the total calories you burn in a complete day, including all
          activities.
        </Typography>
        <Typography variant="h3" gutterBottom align="center">
          TDEE Breakdown:
        </Typography>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <GridInfoCard
            icon="faHeart"
            title="Basal Metabolic Rate (BMR)"
            percentage="60-70%"
            description="Energy for basic body functions"
          />
          <GridInfoCard
            icon="faRunning"
            title="Physical Activity"
            percentage="15-30%"
            description="Exercise and daily movement"
          />
          <GridInfoCard
            icon="faFire"
            title="Thermic Effect of Food (TEF)"
            percentage="10%"
            description="Energy needed to digest food"
          />
          <GridInfoCard
            icon="faWalking"
            title="NEAT"
            percentage="Variable"
            description="Non-exercise activity thermogenesis"
          />
        </div>
      </Container>
      <Container
        maxWidth={false}
        sx={{ py: 4 }}
        style={{
          borderRadius: "12px",
          marginTop: "24px",
          border: "1px solid rgba(119, 124, 124, 0.2)",
        }}
      >
        <Typography variant="h2" gutterBottom align="center">
          Creating a Calorie Deficit
        </Typography>
        <Typography align="center" color="text.white" mb={4}>
          Weight loss occurs when you consume fewer calories than your TDEE.
          Your body uses stored fat for energy.
        </Typography>
        <Card sx={{ borderRadius: 12, maxWidth: 500, margin: "0 auto" }}>
          <CardContent>
            <img src={deficit} alt="Deficit vs Surplus" />
          </CardContent>
        </Card>
        <Alert severity="warning" variant="outlined" className="mt-5">
          <ul className="text-white">
            <li>
              <strong>Recommended deficit:</strong> 300-500 calories/day
            </li>
            <li>
              <strong>Expected loss:</strong> 0.5-1 kg per week
            </li>
            <li>
              <strong>Minimum intake:</strong> Women 1,200-1,500 cal, Men
              1,500-1,800 cal
            </li>
          </ul>
        </Alert>
      </Container>

      <Container
        maxWidth={false}
        sx={{ py: 4 }}
        style={{
          background:
            "linear-gradient(135deg, rgba(29, 78, 216, 0.15) 0%, rgba(8, 145, 178, 0.15) 100%)",
          width: "calc(100vw - 4px)",
          maxWidth: "100vw",
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          borderRadius: 0,
        }}
      >
        <Typography variant="h2" gutterBottom align="center">
          BMR & TDEE Calculator
        </Typography>
        <Card sx={{ my: 5 }}>
          <form id="myForm" onSubmit={handleSubmit}>
            <CardHeader title="Calculate Your BMR & TDEE" />
            <CardContent>
              {errors.calorieSafety && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {errors.calorieSafety}
                </Alert>
              )}
              <Stack spacing={3} className="text-left">
                <h2>Step 1: Personal Information</h2>
                <FormControl fullWidth margin="normal" error={!!errors.gender}>
                  <FormLabel id="demo-row-radio-buttons-group-label">
                    Gender
                  </FormLabel>
                  <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="gender"
                    value={formValues.gender}
                    onChange={handleChange}
                  >
                    <FormControlLabel
                      value="male"
                      control={<Radio />}
                      label="Male"
                    />
                    <FormControlLabel
                      value="female"
                      control={<Radio />}
                      label="Female"
                    />
                  </RadioGroup>
                </FormControl>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    "& > :not(style)": { m: 1 },
                  }}
                >
                  <TextField
                    helperText={errors.age || "Please enter your age in years"}
                    error={!!errors.age}
                    id="age"
                    label="Age"
                    type="number"
                    slotProps={{
                      input: {
                        min: 0,
                        max: 100,
                        step: 1,
                      },
                    }}
                    name="age"
                    value={formValues.age}
                    onChange={handleChange}
                  />
                  <TextField
                    helperText={
                      errors.weight || "Please enter your weigth in kg "
                    }
                    error={!!errors.weight}
                    id="weight"
                    label="Weight"
                    type="number"
                    slotProps={{
                      input: {
                        min: 0,
                        max: 100,
                        step: 1,
                      },
                    }}
                    name="weight"
                    value={formValues.weight}
                    onChange={handleChange}
                  />
                  <TextField
                    helperText={
                      errors.height || "Please enter you height in cm"
                    }
                    error={!!errors.height}
                    id="height"
                    label="Height"
                    type="number"
                    slotProps={{
                      input: {
                        min: 0,
                        max: 100,
                        step: 1,
                      },
                    }}
                    name="height"
                    value={formValues.height}
                    onChange={handleChange}
                  />
                </Box>
                <h2>Step 2: Activity Level</h2>
                <FormControl fullWidth error={!!errors.activityLevel}>
                  <InputLabel id="activity-level-label">
                    Activity Level
                  </InputLabel>
                  <Select
                    labelId="activity-level-label"
                    id="activity-level-select"
                    label="Activity Level"
                    name="activityLevel"
                    value={formValues.activityLevel}
                    onChange={handleChange}
                  >
                    {activityLevels.map((opt) => (
                      <MenuItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </MenuItem>
                    ))}
                  </Select>
                  {errors.activityLevel && (
                    <FormHelperText>{errors.activityLevel}</FormHelperText>
                  )}
                </FormControl>
                <h2>Step 3: Weight Loss Goals</h2>
                <FormControl
                  fullWidth
                  margin="normal"
                  error={!!errors.targetWeight}
                >
                  <TextField
                    helperText={
                      errors.targetWeight || "Please enter target weight in kg"
                    }
                    error={!!errors.targetWeight}
                    id="targetWeight"
                    label="Target Weight"
                    type="number"
                    slotProps={{
                      input: {
                        min: 0,
                        max: 100,
                        step: 1,
                      },
                    }}
                    name="targetWeight"
                    value={formValues.targetWeight}
                    onChange={handleChange}
                  />
                </FormControl>
                <FormControl fullWidth error={!!errors.weeklyLossRate}>
                  <InputLabel id="activity-level-label">
                    Desired Weekly Loss Rate
                  </InputLabel>
                  <Select
                    label="Weekly Loss Rate"
                    name="weeklyLossRate"
                    value={formValues.weeklyLossRate}
                    onChange={handleChange}
                  >
                    <MenuItem value="">Choose loss rate</MenuItem>
                    <MenuItem value="0.25">0.25 kg (slow)</MenuItem>
                    <MenuItem value="0.5">0.5 kg (recommended)</MenuItem>
                    <MenuItem value="0.75">0.75 kg (moderate)</MenuItem>
                    <MenuItem value="1.0">1 kg (aggressive)</MenuItem>
                  </Select>
                  {errors.weeklyLossRate && (
                    <FormHelperText>{errors.weeklyLossRate}</FormHelperText>
                  )}
                </FormControl>
              </Stack>
            </CardContent>

            <CardActions sx={{ justifyContent: "end", mb: 1 }}>
              <Button
                variant="outlined"
                type="reset"
                onClick={() => setFormValues(initialValues)}
              >
                Reset
              </Button>
              <Button variant="contained" type="submit">
                Calculate
              </Button>
            </CardActions>
          </form>
        </Card>
        {/* Results Display */}
        {results && (
          <>
            <Card sx={{ my: 5 }}>
              <CardHeader title="Your Results" />
              <CardContent>
                <Stack direction="row" spacing={4} alignItems="center">
                  <item className="flex">
                    <LocalFireDepartment color="error" />
                    <Typography>
                      <b>BMR:</b> {results.bmr.toFixed(0)} calories/day
                    </Typography>
                  </item>
                  <item className="flex">
                    <FitnessCenter color="primary" />
                    <Typography>
                      <b>TDEE:</b> {results.tdee.toFixed(0)} calories/day
                    </Typography>
                  </item>
                  <item className="flex">
                    <Scale color="success" />
                    <Typography>
                      <b>Target Calories:</b> {results.dailyTarget.toFixed(0)}{" "}
                      calories/day
                    </Typography>
                  </item>
                  <item className="flex">
                    <DateRange color="success" />
                    <Typography>
                      Estimated weeks to goal:{" "}
                      <b>{results.weeksToGoal.toFixed(1)}</b>
                    </Typography>
                  </item>
                  <item className="flex">
                    <CalendarMonth color="success" />
                    <Typography>
                      Estimated months to goal:{" "}
                      <b>{(results.weeksToGoal / 4.345).toFixed(1)}</b>
                    </Typography>
                  </item>
                </Stack>

                {results.dailyTarget < minCal[formValues.gender] && (
                  <h2>
                    Daily calories below safe minimum. Please raise your goal or
                    consult a doctor.
                  </h2>
                )}
                {results.weeklyDeficit / 7 > 1000 && (
                  <Alert severity="warning" sx={{ mt: 2 }}>
                    Your daily deficit is above recommended maximum (1000
                    cal/day)!
                  </Alert>
                )}
              </CardContent>
            </Card>
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
                <h2 className="text-white">Set target calouries</h2>
                <TextField
                  variant="outlined"
                  type="number"
                  name="quantity"
                  value={results.dailyTarget.toFixed(0)}
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
              type="button"
              onClick={handleTargetUpdate(results.dailyTarget.toFixed(0))}
            >
              Update Target Calouries
            </Button>
          </>
        )}
      </Container>
    </>
  );
};

export default CaloriesCalculator;
