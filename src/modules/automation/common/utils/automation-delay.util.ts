export class AutomationDelayUtil {
  public static formatSeconds(delay?: number | null): string {
    return `PT${delay || 0}S`;
  }
}
