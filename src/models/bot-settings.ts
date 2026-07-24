export class BotSettings implements IBotSettings {
    constructor(
        public prefix: string,
        public showReprints: boolean,
    ) { }
}

export interface IBotSettings {
    prefix: string;
    showReprints: boolean;
}