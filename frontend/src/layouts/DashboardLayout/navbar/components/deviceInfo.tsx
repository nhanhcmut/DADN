"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useParams, usePathname } from "next/navigation"; // Next.js routing
import useRoutes from "../../sidebar/variable/route";
import { IoArrowBack } from "react-icons/io5";
import { DeviceOperation } from "@/services/device.service";
import { DeviceDto} from '@/services/device.service';
const DeviceInfo = () => {
    const routes = useRoutes();
    const pathname = usePathname(); // Lấy đường dẫn hiện tại trong Next.js
    const intl = useTranslations("Routes");
    const [deviceName,setDeviceName] = useState<string>("");
    const device = new DeviceOperation();
    const params = useParams();
    const id = params.id as string;
    const fetchData = useCallback(async () => {
        try {
          const response = await device.getDeviceById(id);
          // Kiểm tra nếu response có tồn tại và chứa data
          if (response && response.success && response.data) {
            const data = response.data as DeviceDto;
      
            if (data.name) {
              setDeviceName(data.name);
            }
            else{setDeviceName("");}
          }
        } catch (error) {
          console.error("Error fetching device:", error);
        }
      }, [id]);
      
      useEffect(() => {
        fetchData();
      }, [fetchData]);
    return (
        <div className="ml-[6px] w-full md:w-fit whitespace-nowrap">
            {/* Kiểm tra nếu đang ở trang /devices thì không hiển thị nút quay về */}
            {pathname.endsWith("/devices") ? null : (
              <div className=" flex">
                <Link
                    href="/devices"
                    className=" items-center text-[30px] font-bold hover:text-navy-700 dark:hover:text-white whitespace-nowrap hidden md:block"
                >
                    <IoArrowBack className="mr-2" />
                </Link> 
              <div  className=" items-center text-[22px] font-bold hover:text-navy-700 dark:hover:text-white whitespace-nowrap hidden md:block"
            >{deviceName}</div>
                </div>
            )}
           
        </div>
    );
};

export default DeviceInfo;
