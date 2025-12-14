declare module 'formidable-serverless' {
  import { IncomingMessage } from 'http';

  export interface File {
    filepath: string;
    originalFilename?: string;
    newFilename?: string;
    mimetype?: string;
    size?: number;
  }

  export class IncomingForm {
    constructor(options?: { keepExtensions?: boolean; uploadDir?: string });
    parse(
      req: IncomingMessage | any,
      callback: (
        err: any,
        fields: Record<string, any>,
        files: Record<string, File | File[]>
      ) => void
    ): void;
  }
}
