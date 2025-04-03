"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation"; // Next.js routing
import useRoutes from "../../sidebar/variable/route";
import { IoArrowBack } from "react-icons/io5";

const RouteInfo = () => {
    const routes = useRoutes();
    const pathname = usePathname(); // Lấy đường dẫn hiện tại trong Next.js
    const intl = useTranslations("Routes");
    const [activeRoute, setActiveRoute] = useState<string | undefined>(undefined);

    // Hàm loại bỏ locale khỏi đường dẫn (nếu có)
    const getPathWithoutLocale = (pathname: string) => {
        const parts = pathname.split('/');
        const localePattern = /^[a-z]{2}$/;
        if (localePattern.test(parts[1])) {
            return parts.slice(2).join('/');
        }
        return pathname;
    };

    useEffect(() => {
        const findActiveRouteIndex = () => {
            const cleanPathname = getPathWithoutLocale(pathname);
            return routes.findIndex(route => route.layout && route.path && cleanPathname === route.path);
        };

        const activeIndex = findActiveRouteIndex();
        if (activeIndex !== -1) {
            setActiveRoute(routes[activeIndex].path);
        } else {
            console.warn("Không tìm thấy route phù hợp!");
            setActiveRoute(undefined);
        }
    }, [pathname, routes]);

    return (
        <div className="ml-[6px] w-full md:w-fit whitespace-nowrap">
            {/* Kiểm tra nếu đang ở trang /devices thì không hiển thị nút quay về */}
            {pathname.endsWith("/devices") ? null : (
                <Link
                    href="/devices"
                    className=" items-center text-[30px] font-bold hover:text-navy-700 dark:hover:text-white whitespace-nowrap hidden md:block"
                >
                    <IoArrowBack className="mr-2" />
                </Link>
            )}
        </div>
    );
};

export default RouteInfo;
