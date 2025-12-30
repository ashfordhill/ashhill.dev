// Performance monitoring utilities for debugging

export class PerformanceMonitor {
  private static timers = new Map<string, number>();
  private static enabled = process.env.NODE_ENV === 'development';

  static start(label: string): void {
    if (!this.enabled) return;
    this.timers.set(label, performance.now());
    console.log(`🚀 [Performance] Started: ${label}`);
  }

  static end(label: string): number {
    if (!this.enabled) return 0;
    
    const startTime = this.timers.get(label);
    if (!startTime) {
      console.warn(`⚠️ [Performance] No start time found for: ${label}`);
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(label);
    
    const emoji = duration > 1000 ? '🐌' : duration > 500 ? '⚠️' : '✅';
    console.log(`${emoji} [Performance] ${label}: ${duration.toFixed(2)}ms`);
    
    return duration;
  }

  static measure(label: string, fn: () => void): void {
    this.start(label);
    fn();
    this.end(label);
  }

  static async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<T> {
    this.start(label);
    try {
      const result = await fn();
      this.end(label);
      return result;
    } catch (error) {
      this.end(label);
      throw error;
    }
  }

  static logMemoryUsage(label: string): void {
    if (!this.enabled || !('memory' in performance)) return;
    
    const memory = (performance as any).memory;
    console.log(`🧠 [Memory] ${label}:`, {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    });
  }
}