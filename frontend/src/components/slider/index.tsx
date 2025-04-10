"use client";
import React from "react";

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  onValueChange?: () => void;
  min: number;
  max: number;
}

const Slider: React.FC<SliderProps> = ({ value, onChange, onValueChange, min, max }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    onChange(newValue);

    if (onValueChange) {
      onValueChange();
    }
  };

  return (
    <div className="w-[150px] flex flex-col items-center">
      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={value}
        onChange={handleChange}
        className="slider w-full"
      />
      <div>
        <span className="text-lg">{value}</span>
      </div>
    </div>
  );
};

export default Slider;
