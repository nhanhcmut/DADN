"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, usePathname } from "next/navigation"; // Next.js routing
import useRoutes from "../../sidebar/variable/route";
import { IoArrowBack } from "react-icons/io5";
import { DeviceOperation } from "@/services/device.service";
import { DeviceDto } from "@/services/device.service";
import { IoPencil } from "react-icons/io5"; // Icon chỉnh sửa
import DetailPopup from "@/components/popup";
import RenderCase from "@/components/render";
import { FaKey, FaUserCircle } from "react-icons/fa";
import CustomInputField from "@/components/input";
import CustomButton2 from "@/components/button";
import LoadingUI from "@/components/loading";
import { MdOutlineDevicesOther } from "react-icons/md";
import { useNotifications } from "@/hooks/NotificationsProvider";
import {  } from "@/store/action/deviceSlice";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/store";
import { useRouter } from "next/navigation"; 

const DeviceInfo = () => {
    const router = useRouter();
    const pathname = usePathname(); // Lấy đường dẫn hiện tại trong Next.js
    const intl = useTranslations("Device");
    const [openEdit, setOpenEdit] = useState<boolean>(false);
    const deviceOp = new DeviceOperation();
    const params = useParams();
    const id = params.id as string;
    const [name, setName] = useState<string>("");
    const [location, setLocation] = useState<string>("");
    const [usernameaio, setUsernameaio] = useState<string>("");
    const [keyaio, setKeyaio] = useState<string>("");
    const [isError, setIsError] = useState<boolean>(false);
    const { addNotification } = useNotifications();
    const { loading } = useSelector((state: RootState) => state.auth);
    const fetchData = useCallback(async () => {
        try {
            const response = await deviceOp.getDeviceById(id);
            if (response && response.success && response.data) {
                const data = response.data as DeviceDto;
                setName(data.name || "");
                setLocation(data.location);
                setUsernameaio(data.usernameaio)
                setKeyaio(data.keyaio);
            }
        } catch (error) {
            console.error("Error fetching device:", error);
        }
    }, [id]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEditDevice = async () => {
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
      try{
        const response = await deviceOp.editDevice(
          payload,
          id
        );
        if (response.success) {
        } else {
          console.warn("Lỗi từ server:", response.message);
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật thiết bị:", error);
      }
    };
    const handleDeleteDevice = async () => {
      
      try{
        const response = await deviceOp.deleteDevice(id);
        if (response.success) {
        } else {
          console.warn("Lỗi từ server:", response.message);
        }
      } catch (error) {
        console.error("Lỗi khi cập nhật thiết bị:", error);
      }
    };
    const handleSubmit = () => {
      setIsError(false);
      handleEditDevice();
      setOpenEdit(false);
    };
    const handleDelete = () => {
      setIsError(false);
      handleDeleteDevice();
      setOpenEdit(false);
      router.push("/devices");
    };
    return (
      <>
        <div className="ml-[6px] w-full md:w-fit whitespace-nowrap">
            {pathname.endsWith("/devices") ? null : (
                <div className="flex">
                    <Link
                        href="/devices"
                        className="items-center text-[30px] font-bold hover:text-navy-700 dark:hover:text-white whitespace-nowrap hidden md:block"
                    >
                        <IoArrowBack className="mr-2" />
                    </Link>
                    <div className="items-center text-[22px] font-bold hover:text-navy-700 dark:hover:text-white whitespace-nowrap hidden md:block">
                        {name}
                    </div>
                    <button
                    onClick={() => {
                      setOpenEdit(true);
                    }}
                        className="ml-4 flex items-center text-[22px] font-bold hover:text-blue-700 whitespace-nowrap"
                    >
                        <IoPencil className="mr-2" />
                    </button>
                </div>
            )}
        </div>
        <RenderCase condition={openEdit}>
        <DetailPopup
          onClose={() => setOpenEdit(false)}
          title={intl("InfoTitleEdit")}
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
          <div className=" items-center justify-center flex pt-4 gap-2 pb-2">
            <CustomButton2
              version="1"
              color="error"
              onClick={handleSubmit}
              className="linear w-[200px] rounded-md bg-[#1e8323] dark:!bg-[#1e8323] h-10 text-base font-medium text-white transition duration-200 hover:bg-red-600 
                active:bg-red-700 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300 flex justify-center place-items-center"
            >
              {loading ? <LoadingUI /> : intl("Update")}
            </CustomButton2>
            <CustomButton2
              version="1"
              color="error"
              onClick={handleDelete}
              className="linear w-[200px] rounded-md bg-[#a82323] dark:!bg-[#a82323] h-10 text-base font-medium text-white transition duration-200 hover:bg-red-600 
                active:bg-red-700 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300 flex justify-center place-items-center"
            >
              {loading ? <LoadingUI /> : intl("Delete")}
            </CustomButton2>
          </div>
        </DetailPopup>
      </RenderCase>
        </>
    );
};

export default DeviceInfo;
