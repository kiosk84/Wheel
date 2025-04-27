export {};

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready(): void;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
          };
        };
      };
    };
  }
}
