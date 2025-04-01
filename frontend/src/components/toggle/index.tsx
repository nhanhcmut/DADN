"use client";

import { useTranslations } from "next-intl";
import React, { useState } from "react";

const Toggle: React.FC<ToggleProps> = ({ isOn, onToggle, label }:ToggleProps) => {
  const intl = useTranslations("Components");
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[20px] text-center font-medium">{label}</span>
      <button
        onClick={onToggle}
        className={`w-24 h-12 flex items-center justify-between ${
          isOn ? "bg-green-500" : "bg-gray-300"
        } rounded-full p-2 transition duration-300`}
      >
        <div
          className={`w-8 h-8 bg-white rounded-full shadow-md transform ${
            isOn ? "translate-x-12" : "translate-x-0"
          } transition duration-300`}
        >
        </div>
        <span
          className={`absolute text-[18px] font-bold text-white ${
            isOn ? "left-[90px]" : "right-[90px]"
          }`}
        >
          {isOn ? intl("on") : intl("off")}
        </span>
      </button>
    </div>
  );
};

export default Toggle;
