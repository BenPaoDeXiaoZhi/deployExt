export interface Project {
  extensions: string[];
  meta: any;
  gandi: {
    assets: GandiAsset[];
  };
  targets: Target[];
}

export interface GandiAsset<
  MD5 extends string = string,
  EXT extends string = string,
> {
  id: string;
  assetId: string;
  name: string;
  md5ext: `${MD5}.${EXT}`;
  dataFormat: EXT;
}

export interface Target {
  isStage: boolean;
  name: string;
  variables: Record<string, [string, number]>;
  lists: {};
  broadcasts: {};
  blocks: {};
  comments: Record<
    string,
    {
      blockId: null;
      x: number;
      y: number;
      width: number;
      height: number;
      minimized: boolean;
      text: string;
    }
  >;
  frames: {};
  currentCostume: number;
  costumes: any[];
  sounds: any[];
  volume: number;
  layerOrder: number;
  extractProperties: {};
  tempo: number;
  videoTransparency: number;
  videoState: string;
  textToSpeechLanguage: null;
}
