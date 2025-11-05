import React from "react";
import { PieChart } from "@mui/x-charts/PieChart";
const CalorieChart = ({ targetCalouries, totalCalories }) => {
  console.log(targetCalouries, totalCalories);

  const target = Number(targetCalouries);
  const consumed = Number(totalCalories);

  let chartData = [];

  if (target > 0) {
    if (consumed <= target) {
      // Consumed is less than or equal to target
      chartData = [
        { id: 'consumed', value: consumed, label: 'Consumed', color: '#4CAF50' }, // Green
        { id: 'remaining', value: target - consumed, label: 'Remaining', color: '#FFC107' }, // Amber
      ];
    } else {
      // Consumed is greater than target (excess)
      chartData = [
        { id: 'target', value: target, label: 'Target Met', color: '#4CAF50' }, // Green
        { id: 'excess', value: consumed - target, label: 'Excess', color: '#F44336' }, // Red
      ];
    }
  } else {
    // No target set or target is 0
    if (consumed > 0) {
      chartData = [
        { id: 'consumed', value: consumed, label: 'Consumed (No Target)', color: '#F44336' }, // Red, as there's no target to compare against
      ];
    } else {
      // Both target and consumed are 0
      chartData = [
        { id: 'no_data', value: 1, label: 'No Data', color: '#9E9E9E' }, // Grey, placeholder
      ];
    }
  }

  return (
    <PieChart
      series={[
        {
          data: chartData,
          highlightScope: { faded: "global", highlighted: "item" },
          faded: { innerRadius: 30, outerRadius: 60, color: "gray" },
        },
      ]}
      slotProps={{
        legend: {
          hidden: true, // This hides the legend
        },
      }}
      height={200}
    />
  );
};

export default CalorieChart;
