"use client";
import HistoryChart from "@/components/chart";
import CircleProgress from "@/components/circleprogess";
import Container from "@/components/container";
import Slider from "@/components/slider";
import Toggle from "@/components/toggle";
import { useTranslations } from "next-intl";
import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { SensorDataOperation } from "@/services/sensorData.service";
import { WaterProcessOperation } from "@/services/waterProcess.service";
import { HistoryOperation } from "@/services/history.service";
import { ActivationConditionOperation } from "@/services/activationCondition.service";
import { ActivationConditionDto} from '@/services/activationCondition.service';

const SensorDataMain = () => {
  const intl = useTranslations("SensorData");
  const [isTemperatureOn, setTemperatureOn] = useState<boolean>(false);
  const [isHumidityOn, setHumidityOn] = useState<boolean>(false);
  const [isPumpOn, setPumpOn] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(75);
  const [temperature, setTemperature] = useState<number>(0);
  const [humidity, setHumidity] = useState<number>(0);
  const [temperatureStart, setTemperatureStart] = useState<number>(0);
  const [temperatureStop, setTemperatureStop] = useState<number>(0);
  const [humidityStart, setHumidityStart] = useState<number>(0);
  const [humidityStop, setHumidityStop] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const sensorData = new SensorDataOperation();
  const waterProcessOp = new WaterProcessOperation();
  const historyOp = new HistoryOperation();
  const activationConditionOp = new ActivationConditionOperation();
  const params = useParams();
  const id = params.id as string;
  const [historyData, setHistoryData] = useState<HistoryEntry[]>([]);
  

  const fetchSensorData = async () => {
    try {
      const response = await sensorData.getSensorData(id);
      if (
        response?.data &&
        Array.isArray(response.data) &&
        response.data.length > 0
      ) {
        const firstEntry = response.data[0];
        setTemperature(Number(firstEntry.tempvalue));
        setHumidity(Number(firstEntry.humidvalue));
      } else {
        console.warn("Không tìm thấy dữ liệu cảm biến.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchSensorData();
    }, 2000);

    return () => clearInterval(interval);
  }, [id]);
  const fetchHistoryData = async () => {
    try {
      const response = await historyOp.getHistoryData(id);

      const data = response?.data as HistoryResponse;

      if (
        data?.history &&
        Array.isArray(data.history) &&
        data.history.length > 0
      ) {
        const mappedData = data.history.map((entry) => ({
          time_ICT: entry.time_ICT,
          temperature: Number(entry.temperature),
          humidity: Number(entry.humidity),
        }));
        setHistoryData(mappedData);
      } else {
        console.warn("Không tìm thấy dữ liệu cảm biến.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      fetchHistoryData();
    }, 2000);

    return () => clearInterval(interval);
  }, [id]);

  // Fetch water process data from the API
  const fetchWaterProcess = async () => {
    try {
      const response = await waterProcessOp.getWaterProcess(id);
      if (Array.isArray(response.data) && response.data.length > 0) {
        const data = response.data[0];
        setHumidityOn(data.humidControlled);
        setTemperatureOn(data.tempControlled);
        setPumpOn(data.manualControl);
        setSpeed(Number(data.pumpSpeed));
      } else {
        console.warn("Dữ liệu API không đúng hoặc rỗng.");
      }
    } catch (error) {
      console.error("Lỗi khi lấy dữ liệu:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      fetchWaterProcess();
    }, 2000); // Gọi mỗi 5 giây

    return () => clearInterval(interval);
  }, [id]);


 const fetchActivationCondition = async () => {
  try {
    console.log("fetchActivationCondition");

    const response = await activationConditionOp.getActivationCondition(id);
    console.log(response);

    const data = response.data as ActivationConditionDto;
    if (data && data.conditions) {
      setTemperatureStart(data.conditions.temperature.start);
      setTemperatureStop(data.conditions.temperature.stop);
      setHumidityStart(data.conditions.humidity.start);
      setHumidityStop(data.conditions.humidity.stop);
    } else {
      console.warn("Dữ liệu API không đúng hoặc rỗng.");
    }
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu:", error);
  }
};
  
  useEffect(() => {
    const interval = setInterval(() => {
      fetchActivationCondition();
    }, 2000);

    return () => clearInterval(interval);
  }, [id]);

  const updateWaterProcess = async () => {
    setLoading(true); // Set loading to true while updating
    const payload = {
      tempControlled: isTemperatureOn,
      humidControlled: isHumidityOn,
      manualControl: isPumpOn,
      pumpSpeed: speed,
    };
    try {
      const response = await waterProcessOp.updateWaterProcess(payload, id);
      if (response.success) {
      } else {
        console.warn("Lỗi từ server:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật quy trình nước:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateActivationCondition = async () => {
    setLoading(true);
    const payload = {
      conditions: {
        temperature: {
          start: temperatureStart,
          stop: temperatureStop,
        },
        humidity: {
          start: humidityStart,
          stop: humidityStop,
        },
      },
    };
    try {
      const response = await activationConditionOp.updateActivationCondition(
        payload,
        id
      );
      if (response.success) {
        console.log(response.data);
      } else {
        console.warn("Lỗi từ server:", response.message);
      }
    } catch (error) {
      console.error("Lỗi khi cập nhật quy trình nước:", error);
    } finally {
      setLoading(false);
    }
  };


  const [isDataFetched, setIsDataFetched] = useState(false);
  useEffect(() => {
    const fetchData = async () => {
      await fetchSensorData();
      await fetchHistoryData();
      await fetchWaterProcess();
      await fetchActivationCondition();
  
      setIsDataFetched(true); // Xác nhận fetch đã hoàn tất
    };
  
    fetchData();
  }, [id]);
  
  useEffect(() => {
    if (isDataFetched) {
      updateWaterProcess();
    }
  }, [speed, isHumidityOn, isTemperatureOn, isPumpOn, isDataFetched]);
  
  useEffect(() => {
    if (isDataFetched) {
      updateActivationCondition();
    }
  }, [temperatureStart, temperatureStop, humidityStart, humidityStop, isDataFetched]);
  
  return (
    <div className="w-full max-h-screen gap-4 flex flex-col pb-4 ">
      <div className="flex w-full h-fit flex-row gap-4">
        <Container className="w-fit h-fit gap-4 p-4 flex flex-col relative">
          <CircleProgress value={temperature} type="temperature" />
          <CircleProgress value={humidity} type="humidity" />
        </Container>
        <Container className="w-full p-4 flex items-center justify-center">
          <HistoryChart data={historyData} />
        </Container>
      </div>
      <div className="flex w-full h-fit flex-row gap-4 pb-4">
        <Container className="w-[230px] h-fit gap-4 p-4 flex flex-col relative">
          <a className="font-bold text-center">{intl("withcondition")}</a>
          <div className="flex flex-col items-center gap-4">
            <Toggle
              isOn={isTemperatureOn}
              onToggle={() => setTemperatureOn(!isTemperatureOn)}
              label={intl("temperature")}
            />
            <Toggle
              isOn={isHumidityOn}
              onToggle={() => setHumidityOn(!isHumidityOn)}
              label={intl("humidity")}
            />
          </div>
        </Container>
        <div className="flex flex-col items-center gap-4">
          <Container className="w-[230px] h-full gap-4 p-4 flex flex-col relative">
            <Toggle
              isOn={isPumpOn}
              onToggle={() => setPumpOn(!isPumpOn)}
              label={intl("pump")}
            />
          </Container>
          <Container className="w-[230px] h-fit gap-4 p-3 pt-4 items-center flex flex-col relative">
            <h1 className="text-[20px] font-b font-medium text-center">
              {intl("speed")}
            </h1>
            <Slider value={speed} onChange={(newValue) => setSpeed(newValue)} min={0} max={100} />
          </Container>
        </div>
        {(isTemperatureOn || isHumidityOn) && (
          <Container className="flex w-fit items-center justify-center gap-4">
            {isTemperatureOn && (
              <div className="w-[230px] items-center gap-4 justify-center flex flex-col">
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("temperaturestart")}
                </h1>
                <Slider
                  value={temperatureStart}
                  onChange={setTemperatureStart}
                  min={0} max={100}
                />
                <h1 className="text-[20px] font-b pt-2 font-medium text-center">
                  {intl("temperaturestop")}
                </h1>
                <Slider value={temperatureStop} 
                onChange={setTemperatureStop} 
                min={0} max={temperatureStart}
                />
              </div>
            )}
            {isHumidityOn && (
              <div className="w-[230px] items-center gap-4 justify-center flex flex-col">
                <h1 className="text-[20px] font-b font-medium text-center">
                  {intl("humiditystart")}
                </h1>
                <Slider value={humidityStart} onChange={setHumidityStart} min={0} max={100} />
                <h1 className="text-[20px] font-b pt-2 font-medium text-center">
                  {intl("humiditystop")}
                </h1>
                <Slider value={humidityStop} onChange={setHumidityStop} min={humidityStart} max={100} />
              </div>
            )}
          </Container>
        )}
      </div>
    </div>
  );
};

export default SensorDataMain;
