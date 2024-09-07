type WorkerMessage<T> = {
    result: T;
} | {
    error: string;
};

export class WorkerWrapper {
    private worker: Worker;

    constructor() {
        this.worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' });
    }

    async run<T>(fnString: string, ...args: any[]): Promise<T> {
        return new Promise((resolve, reject) => {
            const messageHandler = (event: MessageEvent<WorkerMessage<T>>) => {
                this.worker.removeEventListener('message', messageHandler);
                this.worker.removeEventListener('error', errorHandler);
                if ('error' in event.data) {
                    reject(new Error(event.data.error));
                } else {
                    resolve(event.data.result);
                }
            };

            const errorHandler = (error: ErrorEvent) => {
                this.worker.removeEventListener('message', messageHandler);
                this.worker.removeEventListener('error', errorHandler);
                reject(error);
            };

            this.worker.addEventListener('message', messageHandler);
            this.worker.addEventListener('error', errorHandler);

            this.worker.postMessage({ fnString, args });
        });
    }
}