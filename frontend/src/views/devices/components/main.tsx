"use client"
import AddButton from "@/components/addbutton";
import DeviceButton from "@/components/device";
import { useTranslations } from "next-intl";
import LoadingUI from "@/components/loading";
import { AppDispatch, RootState } from "@/store";
import CustomInputField from "@/components/input";
import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNotifications } from "@/hooks/NotificationsProvider";
import { useDefaultNotification } from "@/hooks/DefaultNotificationProvider";
import RenderCase from "@/components/render";
import DetailPopup from "@/components/popup";

import CustomButton2 from "@/components/button";
import { createDevice} from "@/store/action/deviceSlice";
import { MdOutlineDevicesOther } from "react-icons/md";
// Example devices data
const exampleDevices = [
  { id: 1, name: "Device 1", location: "Ho Chi Minh, Vietnam" },
  { id: 2, name: "Device 2", location: "Hanoi, Vietnam" },
  { id: 3, name: "Device 3", location: "Da Nang, Vietnam" },
];

const DevicesMain = () => {
  const [openAdd, setOpenAdd] = useState<boolean>(false);
  const intl = useTranslations("Device");
  const dispatch = useDispatch<AppDispatch>();
  const { addNotification } = useNotifications();
  const [isError, setIsError] = useState<boolean>(false);
  const { addDefaultNotification } = useDefaultNotification();
  const { loading } = useSelector((state: RootState) => state.auth);
  const [name, setName] = useState<string>("");
  const [location, setLocation] = useState<string>("");
  const [usernameaio, setUsernameaio] = useState<string>("");
  const [keyaio, setKeyaio] = useState<string>("");

  const handleAddClick = () => {
    setOpenAdd(true);
  };

  const handleDeviceButtonClick = (deviceName: string, location: string) => {
    alert(`Device ${deviceName} located in ${location} clicked!`);
  };



  const handleCreateDevice = () => {
    const payload = {
      name: name.trim(),
      location: location.trim(),
      usernameaio: usernameaio.trim(),
      keyaio: keyaio.trim(),
}
    

    if (!name || !location || !usernameaio || !keyaio) {
      addNotification({ type: "error", message: intl("Email and password are required") });
      return;
    }
    
    dispatch(createDevice(payload)).then((data) => {
      if (createDevice.fulfilled.match(data)) {
        addNotification({ type: "success", message: intl("Success") });
      } else if (createDevice.rejected.match(data)) {
        addNotification({ type: "error", message: intl("Fail") });
      }
    });
  };

  const handleSubmit = () => {
      setIsError(false);
      handleCreateDevice();
      setOpenAdd(false)
    }

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Enter") {
          e.preventDefault();
          handleSubmit();
        }
      };
  
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [name, location,usernameaio,keyaio]);
  return (
    <>
    
    <div className="flex flex-wrap gap-4">
      {/* Add Button */}
      <AddButton onClick={handleAddClick} />

      {/* Dynamically Render DeviceButtons */}
      {exampleDevices.map((device) => (
        <DeviceButton
          key={device.id} // Ensure a unique key for each device
          deviceName={device.name}
          location={device.location}
          onClick={() => handleDeviceButtonClick(device.name, device.location)} // Pass dynamic data to the handler
        />
      ))}
    </div>
    <RenderCase condition={openAdd} >
        <DetailPopup
          onClose={()=>setOpenAdd(false)}
          title={intl("InfoTitle")}
          customWidth="w-[400px]gi"
          icon={<MdOutlineDevicesOther  className="w-full h-full" />}
        >
          <CustomInputField
            label={
              <div className="flex gap-1 place-items-center relative mb-1 mt-2">
                {intl("name")}
                <p className="text-red-500">*</p>
              </div>
            }
            state={isError && !name ? "error" : ""}
            placeholder={intl("namePlaceHolder")}
            id="name"
            type="text"
            value={name}
            setValue={setName}
            inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
          />

          <CustomInputField
            label={
              <div className="flex gap-1 place-items-center relative  mb-1 mt-2">
                {intl("location")}
                <p className="text-red-500">*</p>
              </div>
            }
            state={isError && !location ? "error" : ""}
            placeholder={intl("locationPlaceHolder")}
            id="location"
            type="text"
            value={location}
            setValue={setLocation}
            inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
          />

          <CustomInputField
            label={
              <div className="flex gap-1 place-items-center relative  mb-1 mt-2">
                {intl("usernameaio")}
                <p className="text-red-500">*</p>
              </div>
            }
            state={isError && !usernameaio ? "error" : ""}
            placeholder={intl("usernameaioPlaceHolder")}
            id="usernameaio"
            type="text"
            value={usernameaio}
            setValue={setUsernameaio}
            inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
          />
          <CustomInputField
          label={
            <div className="flex gap-1 place-items-center relative  mb-1 mt-2">
              {intl("keyaio")}
              <p className="text-red-500">*</p>
            </div>
          }
          state={isError && !keyaio ? "error" : ""}
          placeholder={intl("keyaioPlaceHolder")}
          id="keyaio"
          type="text"
          value={keyaio}
          setValue={setKeyaio}
          inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
        />
        <div
          className=" items-center justify-center flex pt-4 pb-2">
            <CustomButton2
            version="1"
            color="error"
            onClick={handleSubmit}
            className="linear w-[200px] rounded-md bg-[#1e8323] dark:!bg-[#1e8323] h-10 text-base font-medium text-white transition duration-200 hover:bg-red-600 
                active:bg-red-700 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300 flex justify-center place-items-center"
          >
            {loading ? <LoadingUI /> : intl("Enter")}
          </CustomButton2></div>
          
        </DetailPopup>
      </RenderCase>
    </>
  );
};

export default DevicesMain;
