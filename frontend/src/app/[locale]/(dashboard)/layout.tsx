import { Suspense } from "react";
import DashboardLoading from "./loading";
import DashboardLayout from "@/layouts/DashboardLayout";

const Dashboard = ({ children }: Readonly<{ children: React.ReactNode }>) => {
    return (
        <section
            className="h-dvh w-dvw bg-lightPrimary dark:bg-darkContainerPrimary relatived"
            style={{
                overflowX: "hidden", // Loại bỏ thanh lướt ngang
                display: "flex", // Đảm bảo nội dung bên trong fit với component cha
                flexDirection: "column", // Sắp xếp thành phần con theo chiều dọc
            }}
        >
            <DashboardLayout>
                <Suspense fallback={<DashboardLoading />}>
                    {children}
                </Suspense>
            </DashboardLayout>
        </section>
    );
};

export default Dashboard;
