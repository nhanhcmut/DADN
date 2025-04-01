import React from "react";
import Container from "@/components/container";

const DeviceButton = ({ deviceName, location, onClick }: DeviceButtonProps) => {
  return (
    <button onClick={onClick} >
      <Container className="w-[150px] h-[150px] items-center hover:scale-110 justify-center flex flex-col bg-green-300 gap-3">
        <h1 className=" text-center text-[20px] ">{deviceName}</h1>
        <h1>{location}</h1>
      </Container>
    </button>
  );
};

export default DeviceButton;
