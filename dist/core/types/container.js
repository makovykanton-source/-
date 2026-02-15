export class Container {
    registry = new Map();
    register(token, dependency) {
        this.registry.set(token, dependency);
    }
    resolve(token) {
        const value = this.registry.get(token);
        if (!value) {
            throw new Error(`Dependency not found: ${token}`);
        }
        return value;
    }
}
