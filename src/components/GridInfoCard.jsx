import { Card, Grid, CardContent } from "@mui/material";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { iconMap } from "../../iconMap"
import React from "react";

const GridInfoCard = ({ icon, title, percentage, description }) => {
  return (
    <Card
      style={{
        borderRadius: "12px",
        border: "1px solid rgba(119, 124, 124, 0.2)",
        background: "transparent",
      }}
    >
      <CardContent>
        <Grid container spacing={2}>
          <div className="flex flex-row items-center">
            <FontAwesomeIcon
              icon={iconMap[icon]}
              title="Food Tracker"
              className="text-white"
            />
            <div className="flex flex-col ml-2 mr-auto">
              <h2 className="font-semibold text-white text-left">{title}</h2>
            </div>
          </div>
          <div className="flex flex-row w-full items-center text-white">
            <p style={{ color: "rgba(50, 184, 198, 1)" }}>{percentage}</p>
          </div>
          <div className="flex flex-row w-full items-center text-white">
            <p>{description}</p>
          </div>
        </Grid>
      </CardContent>
    </Card>
  );
};

export default GridInfoCard;