interface Caption {
  text: string;
  confidence: number;
}

export interface CaptionData {
  description: {
    tags: string[];
    captions: Caption[];
  };
  requestId: string;
  metadata: {
    height: number;
    width: number;
    format: string;
  };
  modelVersion: string;
  error?: {
    code: number;
    innererror: {
      code: number;
      message: string;
    };
    message: string;
  };
}
