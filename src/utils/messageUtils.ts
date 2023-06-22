import { getApplicationImage, getApplicationName } from "./appUtils";

export const getDownloadText = () => `
  # 🚨Error: ${getApplicationName()} browser is not installed
  ## This extension requires ${getApplicationName()} browser. You must install it to continue.
  
  If you have [Homebrew](https://brew.sh/) installed then press ⏎ (Enter Key) to install ${getApplicationName()} browser.

  [Click here](https://www.microsoft.com/en-us/edge/download) if you want to download manually.
  
  ![${getApplicationName()}](${getApplicationImage()}})
`;

export const getNoBookmarksText = () => `
  # 🚨Error: ${getApplicationName()} browser has no bookmarks.

  ![${getApplicationName()}](${getApplicationImage()})
`;

export const getNoCollectionsText = () => `
  # 🚨Error: ${getApplicationName()} browser has no collections. 

  ![${getApplicationName()}](${getApplicationImage()})
`;

export const getUnknownErrorText = () => `
  # 🚨Error: Something happened while trying to run your command
    
  ![${getApplicationName()}](${getApplicationImage()})
`;

export const geNotInstalledMessage = () => `${getApplicationName()} is not installed`;

export const getNoBookmarksMessage = () => `${getApplicationName()} has no bookmarks.`;
