import Switch from "@/components/switch";

const ThemeSwitcherV1 = ({ checked, handleToggleTheme }: ThemeVersionProps) => {
    return (
        <Switch checked={checked} color="red" onChange={handleToggleTheme} className="dark:checked:!bg-[#1e8323]" />
    );
};

export default ThemeSwitcherV1;