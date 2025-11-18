import { useState, useEffect } from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import './App.css'
import ResponsiveAppBar from './components/ResponsiveAppBar'
import FoodTracker from './components/Dashboard';
import CaloriesCalculator from './components/CaloriesCalculator';
import { Snackbar, Alert } from "@mui/material";
import { auth } from './firebase';
import SignIn from './components/SignIn';

function App() {
  const [user, setUser] = useState(null);
  const [targetCalouries, setTargetCalouries] = useState(0);
  /* snackbar definition*/
  const [snackBar, setSnackBar] = useState(false);
  const [snackBarMsg, setSnackBarMsg] = useState("");
  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackBar(false);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        const foodTargetKey = `intakeFoodTarget_${user.uid}`;
        const savedFoodTarget = localStorage.getItem(foodTargetKey);
        console.log(savedFoodTarget);
        
        if (savedFoodTarget) {
          setTargetCalouries(savedFoodTarget);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <BrowserRouter>
      <ResponsiveAppBar user={user} />
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
      {user ? (
        <Routes>
          {/* Public route for logging in */}
          {/* Protected routes wrapped in the ProtectedRoute component */}
          <Route
            path="/"
            element={
              <FoodTracker targetCalouries={targetCalouries} setSnackBar={setSnackBar} setSnackBarMsg={setSnackBarMsg} user={user} />
            }
          />
          <Route
            path="/bmr-tdee"
            element={
              <CaloriesCalculator targetCalouries={targetCalouries} setTargetCalouries={setTargetCalouries} setSnackBar={setSnackBar} setSnackBarMsg={setSnackBarMsg} user={user} />
            }
          />
          <Route
            path="/calories-calculator"
            element={
              <FoodTracker targetCalouries={targetCalouries} setSnackBar={setSnackBar} setSnackBarMsg={setSnackBarMsg} user={user} />
            }
          />
        </Routes>
      ) : (
        <SignIn />
      )}
    </BrowserRouter>
  )
}

export default App
