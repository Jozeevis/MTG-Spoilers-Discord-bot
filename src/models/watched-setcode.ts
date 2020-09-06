export class WatchedSetCode implements IWatchedSetcode {
    constructor(
        public setCode: string,
        public channelID: string,
    ) { }
}

export interface IWatchedSetcode {
    setCode: string;
    channelID: string;
}