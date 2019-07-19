interface IDMObjectType<T extends string> {
    _tag: T
}

type Fields<T> = Exclude<keyof T, '_tag'> & string
type ResultType<T extends IDMObjectType<string>, D extends IDMObjectType<string>, Fields extends keyof T> = Pick<T, Fields> & IDMObjectType<T['_tag']>

export type ReferenceType<T> = Partial<T> & {
    _ref: string
    _refResourceCollection: string,
    _refResourceId: string,
    _refProperties: {
        _id: string
        _rev: string
    },
}


const assignType = (type: string) => (obj: unknown) => ({_tag: type, ...obj}) as unknown

export class IDMObject<T extends IDMObjectType<string>, D extends IDMObjectType<string>> {
    constructor(private readonly type: T['_tag']) { }

    public read<F extends Fields<T>>(id: string, options: {params?: object, fields: [F, ...F[]]}): ResultType<T, D, F>
    public read<F extends Fields<T>>(id: string, options: {params?: object}): D
    public read<F extends Fields<T>>(id: string): D
    public read<F extends Fields<T>>(id: string, options: {params?: object, fields?: F[]} = {}) {
        return openidm.read(`${this.type}/${id}`, options.params, options.fields).map(assignType(this.type))
    }

    public create<F extends Fields<T>>(id: string, newResourceId: string, content: object, params: object | undefined, fields: F[]): ResultType<T, D, F>
    public create<F extends Fields<T>>(id: string, newResourceId: string, content: object, params?: object): D
    public create<F extends Fields<T>>(id: string, newResourceId: string, content: object, params?: object, fields?: F[]) {
        return assignType(this.type)(openidm.create(`${this.type}/${id}`, newResourceId, content, params, fields))
    }

    public patch<F extends Fields<T>>(id: string, rev: string, value: object, params: object | undefined, fields: F[]): ResultType<T, D, F>
    public patch<F extends Fields<T>>(id: string, rev: string, value: object, params?: object): D
    public patch<F extends Fields<T>>(id: string, rev: string, value: object, params?: object, fields?: F[]) {
        return assignType(this.type)(openidm.patch(`${this.type}/${id}`, rev, value, params, fields))
    }

    public update<F extends Fields<T>>(id: string, rev: string, value: object, params: object | undefined, fields?: F[]): ResultType<T, D, F>
    public update<F extends Fields<T>>(id: string, rev: string, value: object, params?: object): D
    public update<F extends Fields<T>>(id: string, rev: string, value: object, params?: object, fields?: F[]) {
        return assignType(this.type)(openidm.update(`${this.type}/${id}`, rev, value, params, fields))
    }

    public delete<F extends Fields<T>>(id: string, rev: string, params: object | undefined, fields?: F[]): ResultType<T, D, F>
    public delete<F extends Fields<T>>(id: string, rev: string, params?: object): D
    public delete<F extends Fields<T>>(id: string, rev: string, params?: object, fields?: F[]) {
        return assignType(this.type)(openidm.delete(`${this.type}/${id}`, rev, params, fields))
    }

    public query<F extends Fields<T>>(params: QueryFilter, fields: F[]): QueryResult<ResultType<T, D, F>>
    public query<F extends Fields<T>>(params: QueryFilter): QueryResult<D>
    public query<F extends Fields<T>>(params: QueryFilter, fields?: F[]) {
        const response = openidm.query(this.type, params, fields)
        const result = response.result.map(assignType(this.type))
        return {...response, result}
    }
}

export const idmObject = <T extends IDMObjectType<string>, D extends IDMObjectType<string>>(type: T['_tag']) => new IDMObject<T, D>(type)