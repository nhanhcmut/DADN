"use client";
import React from "react";


const Slider: React.FC<SliderProps> = ({ value, onChange }  :SliderProps) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value);
    onChange(newValue);
  };

  return (
    <div className="w-[150px] flex flex-col items-center">
      <input
        type="range"
        min={0}
        max={100}
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
