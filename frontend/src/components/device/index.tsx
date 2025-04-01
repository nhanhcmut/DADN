import React from "react";
import Container from "@/components/container";

const DeviceButton = ({ deviceName, location, onClick }: DeviceButtonProps) => {
  return (
    <button>
      <Container className="w-[150px] h-[150px] items-center justify-center flex flex-col ">
        <h1>{deviceName}</h1>
        <h1>{location}</h1>
      </Container>
    </button>
  );
};

export default DeviceButton;
