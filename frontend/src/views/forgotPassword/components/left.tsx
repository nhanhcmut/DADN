"use client";

import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import LoadingUI from "@/components/loading";
import ThemeSwitcher from "@/components/theme";
import CustomButton from "@/components/button";
import { AppDispatch, RootState } from "@/store";
import CustomInputField from "@/components/input";
import { useEffect, useRef, useState } from "react";
import LanguageSwitcher from "@/components/language";
import { motion, useAnimation } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { forgotPassword } from "@/store/action/forgotPasswordSlice";
import { useNotifications } from "@/hooks/NotificationsProvider";
import { useDefaultNotification } from "@/hooks/DefaultNotificationProvider";
import Link from "next/link";


const ForgotPasswordLeftContent = ({ isAnimated }: AuthLeftContentProps) => {
  const router = useRouter();
  const control = useAnimation();
  const sectionRef = useRef(null);
  const intl = useTranslations("ForgotPassword");
  const dispatch = useDispatch<AppDispatch>();
  const { addNotification } = useNotifications();
  const [email, setEmail] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const { addDefaultNotification } = useDefaultNotification();
  const { loading } = useSelector((state: RootState) => state.auth);

  const handleForgotPassword = () => {
    const payload = {
        email: email.trim(),
    };
    dispatch(forgotPassword(payload)).then((data) => {
        if (forgotPassword.fulfilled.match(data)) {
            addNotification({ type: "success", message: intl("Success") });
            setTimeout(() => {
                router.push("/"); 
            }, 1500);
        } else if (forgotPassword.rejected.match(data)) {
            addNotification({ type: "error", message: intl("Fail") });
        }
    });
};
  

  const handleSubmit = () => {
    if ( !email) {
      setIsError(true);
      addDefaultNotification({ message: intl("MissingField") });
    }
    else {
      setIsError(false);
      handleForgotPassword();
    }
  };

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
  }, [email]);

  
  return (
    <motion.div
      ref={sectionRef}
      initial="hidden"
      animate={control}
      className={`lg:w-[50%] xl:w-[45%] w-full absolute top-0 px-4 sm:px-8 md:px-32 lg:px-16 transition-all flex justify-center h-full lg:py-2 duration-1000 
            ${isAnimated ? "lg:left-0" : "lg:left-[50%] xl:left-[55%]"}`}
    >
      <div className="grid w-full">
        <div className="w-full flex-col px-2 flex gap-4 justify-center place-items-stretch py-2">
          <div className="flex justify-between flex-col gap-2">
            <h4 className="text-4xl font-bold text-navy-700 dark:text-white flex justify-between place-items-center">
              {intl("ForgotPassword")}
              <ThemeSwitcher />
            </h4>
            <p className="pl-1 text-base text-gray-600">
              {intl("ForgotPasswordSubtitle")}
            </p>
          </div>

          <div className="flex justify-center place-items-stretch flex-col gap-4 w-full py-2">
            <CustomInputField
              label={
                <div className="flex gap-1 place-items-center relative mb-2">
                  {intl("Email")}
                  <p className="text-[#F53939]">*</p>
                </div>
              }
              state={isError && !email? "error" : ""}
              placeholder="example@gmail.com"
              id="email"
              type="text"
              value={email}
              setValue={setEmail}
              inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
            />
          </div>
          <div className="flex gap-3">
            <CustomButton
              version="1"
              color="error"
              onClick={handleSubmit}
              className="linear w-full rounded-xl bg-[#1e8323] dark:!bg-[#1e8323] h-12 text-base font-medium text-white transition duration-200 hover:bg-red-600 
                            active:bg-red-700 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300 flex justify-center place-items-center"
            >
              {loading ? <LoadingUI /> : intl("Enter")}
            </CustomButton>
            <div className="h-full bg-[#1e8323] rounded-full text-white flex justify-center place-items-center">
              <LanguageSwitcher version="2" />
            </div>
          </div>
          <p className=" flex">
            {intl("AlreadyRegister")}
            <Link href="/">
              <button className="ml-1 text-blue-600 ">
                <p> {intl("Login")} </p>
              </button>
            </Link>
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordLeftContent;
