"use client";
import HistoryChart from "@/components/chart";
import CircleProgress from "@/components/circleprogess";
import Container from "@/components/container";
import Slider from "@/components/slider";
import Toggle from "@/components/toggle";
import { useTranslations } from "next-intl";
import CustomButton2 from "@/components/button";
import LoadingUI from "@/components/loading";
import { useNotifications } from "@/hooks/NotificationsProvider";
import { useRouter } from "next/router";
import { useEffect, useState, useCallback} from "react";
import { useParams } from "next/navigation";
import { SensorDataOperation } from "@/services/sensorData.service";
const sampleData = [
  { time: "10:00", temperature: 22, humidity: 60 },
  { time: "11:00", temperature: 24, humidity: 62 },
  { time: "12:00", temperature: 60, humidity: 10 },
  { time: "13:00", temperature: 28, humidity: 66 },
  { time: "14:00", temperature: 30, humidity: 100 },
  { time: "15:00", temperature: 60, humidity: 90 },
];



const SensorDataMain = () => {
 

  const transformedData = sampleData.map(({ time, temperature, humidity }) => ({
    time,
    temperature,
    humidity,
  }));
  const [isTemperatureOn, setTemperatureOn] = useState<boolean>(true);
  const [isHumidityOn, setHumidityOn] = useState<boolean>(true);
  const [isPumpOn, setPumpOn] = useState<boolean>(false);
  const intl = useTranslations("SensorData");
  const [speed, setSpeed] = useState<number>(75);
  
  const [temperatureStart, setTemperatureStart] = useState<number>(40);
  const [temperatureStop, setTemperatureStop] = useState<number>(35);
  const [temperatureSpeed, setTemperatureSpeed] = useState<number>(75);
  const [humidityStart, setHumidityStart] = useState<number>(40);
  const [humidityStop, setHumidityStop] = useState<number>(75);
  const [humiditySpeed, sethumiditySpeed] = useState<number>(75);
  const [isError, setIsError] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const { addNotification } = useNotifications();
  const sensorData = new SensorDataOperation();
;
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const params = useParams();
  const id = params.id as string;
  
  const fetchData = useCallback(async () => {
    try {
      const response = await sensorData.getSensorData(id);
  
      if (response?.data && Array.isArray(response.data) && response.data.length > 0) {
        console.log("Dữ liệu API:", response.data); // Kiểm tra dữ liệu
  
        const firstEntry = response.data[0]; // Lấy phần tử đầu tiên trong mảng
        
        setTemperature(Number(firstEntry.tempvalue));
        setHumidity(Number(firstEntry.humidvalue));
      } else {
        console.warn("Không tìm thấy dữ liệu cảm biến.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  }, [id]);
  
  
  useEffect(() => {
    fetchData();
  }, [fetchData]);


  return (
    <div className="w-full max-h-screen gap-4 flex flex-col pb-4 ">
      <div className="flex w-full h-fit flex-row gap-4">
        <Container className="w-fit h-fit gap-4 p-4 flex flex-col relative">
          <CircleProgress value={temperature} type="temperature" />
          <CircleProgress value={humidity} type="humidity" />
        </Container>
        <Container className="w-full p-4 flex items-center justify-center">
          <HistoryChart data={transformedData} />
        </Container>
      </div>
      <div className="flex w-full h-fit flex-row gap-4 pb-4">
        <Container className="w-[230px] h-fit gap-4 p-4 flex flex-col relative">
          <a className="font-bold text-center">{intl("withcondition")}</a>
          <div className="flex flex-col items-center gap-4">
            <Toggle
              isOn={isTemperatureOn}
              onToggle={() => {
                const newTemperatureState = !isTemperatureOn;
                setTemperatureOn(newTemperatureState);

                if (newTemperatureState) {
                  setPumpOn(false);
                }
              }}
              label={intl("temperature")}
            />

            <Toggle
              isOn={isHumidityOn}
              onToggle={() => {
                const newHumidityState = !isHumidityOn;
                setHumidityOn(newHumidityState);

                if (newHumidityState) {
                  setPumpOn(false);
                }
              }}
              label={intl("humidity")}
            />
          </div>
        </Container>
        {isTemperatureOn || isHumidityOn || (
          <Container className="w-[230px] h-fit gap-4 p-4 flex flex-col relative">
            <Toggle
              isOn={isPumpOn}
              onToggle={() => setPumpOn(!isPumpOn)}
              label={intl("pump")}
            />
          </Container>
        )}
        {isPumpOn && (
          <Container className="w-[200px] h-fit gap-4 p-3 pt-4  flex flex-col relative">
            <h1 className="text-[20px] font-b font-medium text-center">
              {intl("speed")}
            </h1>
            <Slider value={speed} onChange={setSpeed} />
          </Container>
        )}
        {(isTemperatureOn || isHumidityOn) && (
          <Container className="flex-grow flex items-center justify-center gap-4">
            {isTemperatureOn && (
              <div className="w-[200px] items-center justify-center flex flex-col">
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("temperaturestart")}
                </h1>
                <Slider value={temperatureStart} onChange={setTemperatureStart} />
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("temperaturestop")}
                </h1>
                <Slider value={temperatureStop} onChange={setTemperatureStop} />
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("speed")}
                </h1>
                <Slider value={temperatureSpeed} onChange={setTemperatureSpeed} />
              </div>
            )}
            {isHumidityOn && (
              <div className="w-[200px] items-center justify-center flex flex-col">
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("humiditystart")}
                </h1>
                <Slider value={humidityStart} onChange={setHumidityStart} />
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("humiditystop")}
                </h1>
                <Slider value={humidityStop} onChange={setHumidityStop} />
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("speed")}
                </h1>
                <Slider value={humiditySpeed} onChange={sethumiditySpeed} />
              </div>
            )}
            {/* {(isTemperatureOn || isHumidityOn) && (
              <CustomButton2
                version="1"
                color="error"
                onClick={handleSubmit}
                className="linear w-[200px] rounded-md bg-[#1e8323] dark:!bg-[#1e8323] h-10 text-base font-medium text-white transition duration-200 hover:bg-red-600 
                active:bg-red-700 dark:text-white dark:hover:bg-red-400 dark:active:bg-red-300 flex justify-center place-items-center"
              >
                {loading ? <LoadingUI /> : intl("Enter")}
              </CustomButton2>
            )} */}
          </Container>
        )}
      </div>
    </div>
  );
};
export default SensorDataMain;
