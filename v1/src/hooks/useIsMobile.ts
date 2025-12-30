import { useTheme } from '@mui/material/styles';
import { useMediaQuery } from '@mui/material';

/**
 * Custom hook to detect if the current device is mobile
 * Uses Material-UI's breakpoint system to determine mobile devices
 * @returns boolean - true if device is mobile (xs or sm breakpoint)
 */
export const useIsMobile = (): boolean => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md')); // md breakpoint is 900px by default
  
  return isMobile;
};

export default useIsMobile;