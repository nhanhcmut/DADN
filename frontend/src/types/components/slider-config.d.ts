declare type SliderProps = {
    value: number; 
    onChange: (newValue: number) => void; 
    onValueChange?: () => void;
  }