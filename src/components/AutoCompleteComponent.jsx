import React from "react";
import { Card, CardContent, TextField, Autocomplete, Paper } from "@mui/material";
const AutoCompleteComponent = ({
  optionsList,
  label = "Select an option",
  handleSelect,
  value,
  measurementDisable,
  name
}) => {
  return (
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
        <h2 className="text-white">{label}</h2>
        <Autocomplete
          disablePortal
          value={value || null}
          disabled={measurementDisable}
          options={optionsList} // Use the improved options array
          autoHighlight={true}
          onChange={(event, value) => {
            handleSelect(value);
            console.log("Selected:", value); // Now value is { label: '...', id: ... }
          }}
          sx={{
            // Target the text inside the input field
            "& .MuiInputBase-input": {
              color: "white",
            },
            "& .MuiOutlinedInput-root.Mui-disabled .MuiOutlinedInput-notchedOutline": {
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
            "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#2196f3",
            },
            // Change border when focused
            "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
              {
                borderColor: "#2196f3",
              },
            // Style the dropdown arrow
            "& .MuiSvgIcon-root": {
              color: "white",
            },
          }}
          // This styles the actual dropdown list that appears
          PaperComponent={({ children }) => (
            <Paper style={{ background: "#0f172a", color: "white" }}>
              {children}
            </Paper>
          )}
          renderInput={(params) => (
            <TextField {...params} name={name} />
          )}
        />
      </CardContent>
    </Card>
  );
};

export default AutoCompleteComponent;