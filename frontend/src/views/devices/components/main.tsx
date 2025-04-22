"use client";
import AddButton from "@/components/addbutton";
import DeviceButton from "@/components/device";
import { useTranslations } from "next-intl";
import LoadingUI from "@/components/loading";
import { AppDispatch, RootState } from "@/store";
import CustomInputField from "@/components/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNotifications } from "@/hooks/NotificationsProvider";
import { useDefaultNotification } from "@/hooks/DefaultNotificationProvider";
import RenderCase from "@/components/render";
import DetailPopup from "@/components/popup";
import { DeviceOperation } from "@/services/device.service";
import CustomButton2 from "@/components/button";
import { createDevice } from "@/store/action/deviceSlice";
import { MdOutlineDevicesOther } from "react-icons/md";
import { useRouter } from "next/navigation";

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
  const deviceOp = new DeviceOperation();
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const router = useRouter(); 
  const handleAddClick = () => {
    setOpenAdd(true);
  };

  const handleCreateDevice = () => {
    const payload = {
      name: name.trim(),
      location: location.trim(),
      usernameaio: usernameaio.trim(),
      keyaio: keyaio.trim(),
    };

    if (!name || !location || !usernameaio || !keyaio) {
      addNotification({
        type: "error",
        message: intl("MissingField"),
      });
      return;
    }

    dispatch(createDevice(payload)).then((data) => {
      if (createDevice.fulfilled.match(data)) {
        addNotification({ type: "success", message: intl("Success") });
        fetchData();
      } else if (createDevice.rejected.match(data)) {
        addNotification({ type: "error", message: intl("Fail") });
      }
    });
  };

  const handleSubmit = () => {
    setIsError(false);
    setName("");
    setLocation("");
    setKeyaio("");
    setUsernameaio("");
    handleCreateDevice();
    setOpenAdd(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" && openAdd) {
        e.preventDefault();
        handleSubmit();
      }
    };
  
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [openAdd]);
  

  const fetchData = useCallback(async () => {
    try {
      const response = await deviceOp.getDevice();
      if (response?.data && Array.isArray(response.data)) {
        const filteredDevices: DeviceData[] = response.data.map(
          (device: any) => ({
            _id: device._id,
            name: device.name,
            location: device.location,
          })
        );
        setDevices(filteredDevices);
      } else {
        setDevices([]); // Ensuring state is always an array
      }
    } catch (error) {
      console.error("Error fetching devices:", error);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <>
      <div className="flex flex-wrap gap-4">
        <AddButton onClick={handleAddClick}/>
        {devices?.length > 0 &&
          devices.map((device) => (
            <DeviceButton
              key={device._id}
              deviceName={device.name}
              location={device.location}
              onClick={() => router.push(`/devices/${device._id}`)}
            />
          ))}
      </div>
      <RenderCase condition={openAdd}>
        <DetailPopup
          onClose={() => setOpenAdd(false)}
          title={intl("InfoTitle")}
          customWidth="w-[400px]"
          icon={<MdOutlineDevicesOther className="w-full h-full" />}
        >
          <CustomInputField
            label={
              <div className="flex gap-1 place-items-center relative mb-1 mt-2">
                {intl("name")}
                <p className="text-red-500">*</p>
              </div>
            }
            state={isError && !name ? "error" : ""}
            placeholder={intl("namePlaceholder")}
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
            placeholder={intl("locationPlaceholder")}
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
            placeholder={intl("usernameaioPlaceholder")}
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
            placeholder={intl("keyaioPlaceholder")}
            id="keyaio"
            type="text"
            value={keyaio}
            setValue={setKeyaio}
            inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
          />
          <div className=" items-center justify-center flex pt-4 pb-2">
            <CustomButton2
              version="1"
              color="error"
              onClick={handleSubmit}
              className="linear w-[200px] rounded-md bg-[#1e8323] dark:!bg-[#1e8323] h-10 text-base font-medium text-white transition duration-200 hover:bg-red-600 
                active:bg-red-700 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300 flex justify-center place-items-center"
            >
              {loading ? <LoadingUI /> : intl("Enter")}
            </CustomButton2>
          </div>
        </DetailPopup>
      </RenderCase>
    </>
  );
};

export default DevicesMain;
function getTokenFromCookie() {
  throw new Error("Function not implemented.");
}
