export type Multimedia = {
  duration?: number;
  width?: number;
  height?: number;
  filecount?: number;
  highlights?: string;
};

export type CorganizeFile = {
  // Mandatory fields (server-side)
  fileid: string;
  sourceurl: string;
  lastupdated: number;
  filename: string;

  // Optional fields (server-side)
  dateactivated?: number;
  storageservice?: string;
  locationref?: string;
  size?: number;
  mimetype?: string;
  lastopened?: number;
  multimedia?: Multimedia;

  // UI-only fields
  isnewfile: boolean;
  streamingUrl?: string;
  thumbnailurl?: string;
};
