import { ActionIcon, useMantineColorScheme, useComputedColorScheme } from '@mantine/core';
import { IconSunFilled, IconMoonFilled } from '@tabler/icons-react';


export default function ThemeSwitch() {
  const { setColorScheme } = useMantineColorScheme();
  const computedColorScheme = useComputedColorScheme('light', { getInitialValueInEffect: true });

  return (
    <ActionIcon
      onClick={() => setColorScheme(computedColorScheme === 'light' ? 'dark' : 'light')}
      variant="light"
      color={computedColorScheme === 'light' ? 'blue' : 'orange'}
      radius={"lg"}
      aria-label='toggle-switch'
      style={{ position: "absolute", top: "20px", right: "20px", zIndex: 1000 }}
    >
        {computedColorScheme === 'light' ? <IconMoonFilled  /> : <IconSunFilled  />}
    </ActionIcon>
  );
}