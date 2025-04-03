declare type HistoryEntry = {
    time_ICT: string; // The timestamp as string
    temperature: number; // Temperature as string, which we later convert to a number
    humidity: number; // Humidity as string, which we later convert to a number
  }
  declare type HistoryResponse = {
    deviceId: string;
    history: HistoryEntry[]; // An array of history entries
  }