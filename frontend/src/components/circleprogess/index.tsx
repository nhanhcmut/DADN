"use client";
import React from "react";
import { useTranslations } from "next-intl";

const CircleProgress: React.FC<CircleProgessProps> = ({
  value,
  type,
}: CircleProgessProps) => {
  const radius = 120; // Increased radius for a larger circle
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(Math.max(value, 0), 100);
  const offset = circumference - (progress / 100) * circumference;
  const intl = useTranslations("Components");

  const getColor = (
    value: number,
    type: "temperature" | "humidity"
  ): string => {
    if (type === "temperature") {
      if (value >= 75) return "#f44336"; // Red
      if (value >= 50) return "#ffeb3b"; // Yellow
      return "#4caf50"; // Green
    } else if (type === "humidity") {
      if (value >= 75) return "#4caf50"; // Green
      if (value >= 50) return "#ffeb3b"; // Yellow
      return "#f44336"; // Red
    }
    return "#e6e6e6"; // Default grey
  };

  const getName = (type: "temperature" | "humidity"): string => {
    return type === "temperature" ? intl("temperature") : intl("humidity");
  };

  const getIcon = (type: "temperature" | "humidity"): React.ReactNode => {
    return type === "temperature" ? "🌡️" : "💧";
  };

  const color = getColor(progress, type);
  const name = getName(type);
  const icon = getIcon(type);

  return (
    <div
      className="w-fit h-fit relative flex items-center justify-center rounded-primary bg-clip-border
    shadow-shadow-500 dark:!bg-darkContainer dark:text-white dark:shadow-none shadow-3xl bg-gray-500"
    >
      <svg width="200" height="200" viewBox="0 0 300 300">
        <circle
          cx="150"
          cy="150"
          r={radius}
          strokeWidth="18" // Increased stroke width for a bold look
          stroke="#e6e6e6"
          fill="none"
        />
        <circle
          cx="150"
          cy="150"
          r={radius}
          strokeWidth="18" // Increased stroke width for progress
          stroke={color}
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90 150 150)"
        />
        <text
          x="150"
          y="90"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="60"
        >
          {icon}
        </text>
        <text
          x="150"
          y="155"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="50"
          fontWeight="bold"
        >
          {value}
          {type === "temperature" ? "°C" : "%"}
        </text>
        <text
          x="150"
          y="195"
          dominantBaseline="middle"
          textAnchor="middle"
          fontSize="30"
          fill="#555"
        >
          {name}
        </text>
      </svg>
    </div>
  );
};

export default CircleProgress;
