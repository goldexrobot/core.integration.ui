export class ApiResponse<T> {
    readonly result: T | undefined;
    readonly err: ApiError|undefined;

    constructor(props:{result?:T, err?:ApiError}) {
        this.result = props.result;
        this.err = props.err;
    }

    promise(): Promise<T> {
        return new Promise((resolve, reject) => {
            if (this.result) resolve(this.result as T);
            else reject(this.err as ApiError);
        });
    }

    throwIfError() {
        if (this.err) throw this.err as ApiError;
    }
}

export class ApiError extends Error {
    readonly code: number;
    readonly message: string;

    constructor(code:number, message:string) {
        super(`API error code ${code}: ${message}`);

        this.code = code;
        this.message = message;
    }

    throw() {
        throw this;
    }
}