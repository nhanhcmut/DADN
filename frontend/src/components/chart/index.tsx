"use client";
import { useTranslations } from "next-intl";
import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const HistoryChart: React.FC<HistoryChartProps> = ({ data }: HistoryChartProps) => {
  const intl = useTranslations("Components"); 

  const temperatureColor = "#f44336"; // Red for temperature
  const humidityColor = "#1D4ED8"; // Blue for humidity

  const temperatureName = intl("temperature") ; 
  const humidityName = intl("humidity");

  return (
    <div className="w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip
            formatter={(value: number, name: string) =>
              `${value} ${
                name === intl("temperature")
                  ? intl("temperatureUnit") 
                  : intl("humidityUnit") 
              }`
            }
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="temperature"
            stroke={temperatureColor}
            strokeWidth={2}
            name={temperatureName} 
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="humidity"
            stroke={humidityColor}
            strokeWidth={2}
            name={humidityName} 
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default HistoryChart;
