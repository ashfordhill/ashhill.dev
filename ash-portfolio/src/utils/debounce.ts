// Simple debounce utility to prevent rapid function calls
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(() => {
      func(...args);
      timeout = null;
    }, wait);
  };
}

// Cleanup function to clear any pending debounced calls
export function clearDebounce(debouncedFn: any) {
  if (debouncedFn && debouncedFn.timeout) {
    clearTimeout(debouncedFn.timeout);
  }
}