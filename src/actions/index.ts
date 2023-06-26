import { runAppleScript } from "run-applescript";
import { PopToRootType, closeMainWindow, popToRoot } from "@raycast/api";
import { SettingsProfileOpenBehaviour, Tab } from "../types/interfaces";
import { getApplicationName } from "../utils/appUtils";
import { geNotInstalledMessage } from "../utils/messageUtils";

export async function getOpenTabs(): Promise<Tab[]> {
  await validateAppIsInstalled();

  const openTabs = await runAppleScript(`
      set _output to ""
      tell application "${getApplicationName()}"
        set _window_index to 1
        repeat with w in windows
          set _tab_index to 1
          repeat with t in tabs of w
            set _title to get title of t
            set _url to get URL of t
            set _favicon to ""
            set _output to (_output & _title & "${Tab.TAB_CONTENTS_SEPARATOR}" & _url & "${
    Tab.TAB_CONTENTS_SEPARATOR
  }" & _favicon & "${Tab.TAB_CONTENTS_SEPARATOR}" & _window_index & "${
    Tab.TAB_CONTENTS_SEPARATOR
  }" & _tab_index & "\\n")
            set _tab_index to _tab_index + 1
          end repeat
          set _window_index to _window_index + 1
          if _window_index > count windows then exit repeat
        end repeat
      end tell
      return _output
  `);

  return openTabs
    .split("\n")
    .filter((line) => line.length !== 0)
    .map((line) => Tab.parse(line));
}

export async function openNewTab({
  url,
  query,
  profileCurrent,
  profileOriginal,
  openTabInProfile,
}: {
  url?: string;
  query?: string;
  profileCurrent: string;
  profileOriginal?: string;
  openTabInProfile: SettingsProfileOpenBehaviour;
}): Promise<boolean | string> {
  setTimeout(() => {
    popToRoot({ clearSearchBar: true });
  }, 3000);
  await Promise.all([
    closeMainWindow({ clearRootSearch: true, popToRootType: PopToRootType.Suspended }),
    validateAppIsInstalled(),
  ]);

  let script = "";

  const getOpenInProfileCommand = (profile: string) =>
    `
    set profile to quoted form of "${profile}"
    set link to quoted form of "${url ? url : "about:blank"}"
    do shell script "open -na '${getApplicationName()}' --args --profile-directory=" & profile & " " & link
  `;

  switch (openTabInProfile) {
    case SettingsProfileOpenBehaviour.Default:
      script =
        `tell application "${getApplicationName()}"
            activate
            tell window 1
                set newTab to make new tab ` +
        (url
          ? `with properties {URL:"${url}"}`
          : query
          ? 'with properties {URL:"https://www.google.com/search?q=' + query + '"}'
          : "") +
        ` 
            end tell
          end tell
        return true
      `;
      break;
    case SettingsProfileOpenBehaviour.ProfileCurrent:
      script = getOpenInProfileCommand(profileCurrent);
      break;
    case SettingsProfileOpenBehaviour.ProfileOriginal:
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      script = getOpenInProfileCommand(profileOriginal!);
      break;
  }

  return await runAppleScript(script);
}

export async function setActiveTab(tab: Tab): Promise<void> {
  await runAppleScript(`
    tell application "${getApplicationName()}"
      activate
      set index of window (${tab.windowsIndex} as number) to (${tab.windowsIndex} as number)
      set active tab index of window (${tab.windowsIndex} as number) to (${tab.tabIndex} as number)
    end tell
    return true
  `);
}
// TODO: Search tabs shows incorrect message when Dev build is not installed
// TODO: Allow Beta and Canary builds support
// TODO: Fix all https://github.com/raycast/extensions/issues?q=is%3Aissue+microsoft+edge+ issues
// TODO: See if new features can be added to the extension like sidebar, vertical tabs, etc.
export const validateAppIsInstalled = async () => {
  const appInstalled = await runAppleScript(`
    set isInstalled to false
    try
        do shell script "osascript -e 'exists application \\"${getApplicationName()}\\"'"
        set isInstalled to true
    end try

    return isInstalled`);
  if (appInstalled === "false") {
    throw new Error(geNotInstalledMessage());
  }
};
