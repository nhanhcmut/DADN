import { FaFileInvoice, FaHistory, FaUserCheck } from "react-icons/fa";
import { useTranslations } from 'next-intl';

const useRoutes = () => {
  const t = useTranslations('Routes');

  return [
    {
      name: t("devices"),
      layout: "/dashboard",
      path: "devices",
      icon: <FaFileInvoice className="h-4 w-4" />,
    },

  ];
};

export default useRoutes;