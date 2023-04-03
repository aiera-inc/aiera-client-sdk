export type polyfillType = {
    installAll(): void;
};

export type playerType = {
    new (audioEl: HTMLAudioElement): playerType;
    configure(opts: object): void;
    getMediaElement(): HTMLAudioElement;
    goToLive(): void;
    isBrowserSupported(): void;
    load(url: string, opt_startTime?: number, mimetype?: string): Promise<void>;
    seekRange(): {
        end: number;
    };
};

export type shakaUIControls = {
    getPlayer(): playerType;
};

export type shakaUI = {
    Overlay(
        player: playerType,
        container: HTMLElement,
        audio: HTMLElement
    ): {
        new (player: playerType, container: HTMLElement, audio: HTMLElement): void;
    };
    getControls(): {
        getPlayer(): playerType;
    };
};

export type ShakaPlayer = {
    polyfill?: polyfillType;
    Player?: playerType;
    ui: shakaUI;
};
