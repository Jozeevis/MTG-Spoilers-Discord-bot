export class SavedInterval {
    constructor(
        public setcode: string,
        public channel: string,
        public interval: NodeJS.Timeout,
    ) { }
}

export interface ISavedInterval {
    setcode: string,
    channel: string,
    interval: NodeJS.Timeout,
}