import { dropbox } from './clouds/dropbox';
import { googleDrive } from './clouds/google-drive';
import { Clouds } from './types';

export const supportedClouds: Clouds = {
  googleDrive,
  dropbox,
};
