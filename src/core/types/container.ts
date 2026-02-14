export class Container {
  private registry = new Map<string, unknown>();

  register<T>(token: string, dependency: T): void {
    this.registry.set(token, dependency);
  }

  resolve<T>(token: string): T {
    const value = this.registry.get(token);
    if (!value) {
      throw new Error(`Dependency not found: ${token}`);
    }
    return value as T;
  }
}
