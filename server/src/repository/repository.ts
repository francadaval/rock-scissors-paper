export interface Repository<T> {
    findOneById(id: string): Promise<T>;
    save(entity: T): Promise<void>;
    delete(entity: T): Promise<void>;
}