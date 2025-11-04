import { useState } from 'react'
import { BrowserRouter, Route, Routes } from "react-router-dom";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ResponsiveAppBar from './components/ResponsiveAppBar'
import FoodTracker from './components/Dashboard';
import CaloriesCalculator from './components/CaloriesCalculator';



function App() {

  return (
    <BrowserRouter>
      <ResponsiveAppBar />
        
      <Routes>
          {/* Public route for logging in */}
          {/* Protected routes wrapped in the ProtectedRoute component */}
          <Route
            path="/"
            element={
              <FoodTracker />
            }
          />
          <Route
            path="/bmr-tdee"
            element={
              <CaloriesCalculator />
            }
          />
          <Route
            path="/calories-calculator"
            element={
              <FoodTracker />
            }
          />
        </Routes>
    </BrowserRouter>
  )
}

export default App
