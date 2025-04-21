"use client";

import { useState } from "react";
import { AppDispatch, RootState } from "@/store";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import Dropdown from "@/components/dropdown";
import DetailPopup from "@/components/popup";
import RenderCase from "@/components/render";
import { FaKey, FaUserCircle } from "react-icons/fa";
import Container from "@/components/container";
import { logout } from "@/store/action/authSlice";
import { useDispatch, useSelector } from "react-redux";
import { useSubmitNotification } from "@/hooks/SubmitNotificationProvider";
import CustomInputField from "@/components/input";
import CustomButton2 from "@/components/button";
import LoadingUI from "@/components/loading";
import { useDefaultNotification } from "@/hooks/DefaultNotificationProvider";
import { useNotifications } from "@/hooks/NotificationsProvider";
import { resetPassword } from "@/store/action/resetPasswordSlice";
const Avatar = () => {
  const router = useRouter();
  const intl = useTranslations("Navbar");
  const userInfo = useSelector((state: RootState) => state.auth.userInfo);
  const [openInfo, setOpenInfo] = useState<boolean>(false);
  const [openPass, setOpenPass] = useState<boolean>(false);
  const { addSubmitNotification } = useSubmitNotification();
  const { addNotification } = useNotifications();
  const [password, setPassword] = useState<string>("");
  const [newPassword, setNewPassword] = useState<string>("");
  const [reNewPassword, setReNewPassword] = useState<string>("");
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { addDefaultNotification } = useDefaultNotification();
  const dispatch = useDispatch<AppDispatch>();
  const handleLogout = () => {
    addSubmitNotification({
      message: intl("LogoutMessage"),
      submitClick: handleLogoutLogic,
    });
  };

  const handleCloseInfo = () => {
    setNewPassword("");
    setPassword("");
    setReNewPassword("");
    setOpenInfo(false);
    setOpenPass(false);
  };
  

  const handleLogoutLogic = () => {
    dispatch(logout());
    router.push("/");
  };
  const handleSubmit = () => {
    if (!password || !reNewPassword || !newPassword) {
      setIsError(true);
      addDefaultNotification({ message: intl("MissingField") });
     } else if(reNewPassword != newPassword){
      setIsError(true);
      addDefaultNotification({ message: intl("checkpassworfail") });
     }
    else {
      setIsError(false);
      handleResetPassword();
      handleCloseInfo();
    }
  };

  const handleResetPassword = () => {
    if(!userInfo){
      addNotification({ type: "error", message: intl("ko lấy được email người dùng") });
      return;
    }
    const payload = {
      email: userInfo.email,
      password: password.trim(),
      newPassword: newPassword.trim(),
    };
    
    dispatch(resetPassword(payload)).then((data) => {
      if (resetPassword.fulfilled.match(data)) {
        addNotification({ type: "success", message: intl("Success") });
      } else if (resetPassword.rejected.match(data)) {
        addNotification({ type: "error", message: intl("Fail") });
      }
    });
  };

  return (
    <>
      {/* <RenderCase condition={openInfo}>
        <DetailPopup
          onClose={handleCloseInfo}
          title={intl("InfoTitle")}
          customWidth="w-fit"
          icon={<FaUserCircle className="w-full h-full" />}
        >
          <div className="p-2 flex flex-col gap-2">
            <InfoContent />
          </div>
        </DetailPopup>
      </RenderCase> */}

      <RenderCase condition={openPass}>
        <DetailPopup
          onClose={handleCloseInfo}
          title={intl("ChangePass")}
          customWidth="w-fit"
          icon={<FaKey className="w-full h-full" />}
        >
          <CustomInputField
            label={
              <div className="flex gap-1 place-items-center relative mb-1 mt-2">
                {intl("Password")}
                <p className="text-red-500">*</p>
              </div>
            }
            state={isError && !password ? "error" : ""}
            placeholder={intl("PasswordPlaceHolder")}
            id="password"
            type="password"
            value={password}
            setValue={setPassword}
            inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
          />

          <CustomInputField
            label={
              <div className="flex gap-1 place-items-center relative  mb-1 mt-2">
                {intl("NewPassword")}
                <p className="text-red-500">*</p>
              </div>
            }
            state={isError && !newPassword ? "error" : ""}
            placeholder={intl("NewPasswordPlaceHolder")}
            id="password"
            type="password"
            value={newPassword}
            setValue={setNewPassword}
            inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
          />

          <CustomInputField
            label={
              <div className="flex gap-1 place-items-center relative  mb-1 mt-2">
                {intl("NewPassword")}
                <p className="text-red-500">*</p>
              </div>
            }
            state={isError && !reNewPassword ? "error" : ""}
            placeholder={intl("Re-NewPasswordPlaceHolder")}
            id="password"
            type="password"
            value={reNewPassword}
            setValue={setReNewPassword}
            inputClassName="bg-lightContainer dark:!bg-darkContainerPrimary !rounded-xl h-12 border border-gray-200 dark:border-white/10"
          />
          <div
          className=" items-center justify-center flex pt-4 pb-2"><CustomButton2
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

      <Dropdown
        button={
          <div className="avatar w-10 h-10 rounded-full">
            <img
              src="/avatar.jpg"
              alt="avatar"
              width={19200}
              height={10800}
              className="w-full h-full object-cover rounded-full"
            />
          </div>
        }
      >
        <Container className="!absolute -right-1 top-2 flex w-52 flex-col justify-start shadow-xl shadow-shadow-500 dark:text-white dark:shadow-none">
          <div className="p-3.5">
            <div className="flex items-center flex-col gap-.5">
              <p className="text-sm font-normal text-navy-700 dark:text-white w-full text-center">
                {intl("Login")}
              </p>
              <p className="text-sm font-bold text-navy-700 dark:text-white text-center w-full overflow-hidden">
                {userInfo?.username}
              </p>
            </div>
          </div>

          {/* <div className="flex flex-col pb-3 px-3 -mt-4">
            <button
              onClick={() => {
                setOpenInfo(true);
              }}
              className="mt-3 text-sm font-medium text-navy-700 dark:text-white"
            >
              {intl("ViewInfo")}
            </button>
          </div> */}

          <div className="flex flex-col pb-3 px-3 -mt-2">
            <button
              onClick={() => {
                setOpenPass(true);
              }}
              className="mt-3 text-sm font-medium text-navy-700 dark:text-white"
            >
              {intl("ChangePass")}
            </button>
          </div>

          <div className="h-[0.5px] w-full bg-gray-200 dark:bg-white/20" />

          <div className="flex flex-col pb-3 px-3">
            <button
              onClick={handleLogout}
              className="mt-3 text-sm font-medium text-[#1e8323] hover:text-[#1e8323]"
            >
              {intl("Logout")}
            </button>
          </div>
        </Container>
      </Dropdown>
    </>
  );
};

export default Avatar;
