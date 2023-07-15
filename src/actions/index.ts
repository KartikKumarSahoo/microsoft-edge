import { runAppleScript } from "run-applescript";
import { PopToRootType, closeMainWindow, popToRoot } from "@raycast/api";
import { SettingsProfileOpenBehaviour, Tab } from "../types/interfaces";
import { getApplicationName } from "../utils/appUtils";
import { geNotInstalledMessage } from "../utils/messageUtils";
import { DEFAULT_PROFILE_ID } from "../constants";

export async function getOpenTabs(profile: string = DEFAULT_PROFILE_ID): Promise<Tab[]> {
  await validateAppIsInstalled();
  // TODO: This doesn't honor the current profile selection
  // Don't know how to get the current profile from using AppleScript
  console.log("Profile: ", profile);

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
  profileOriginal = DEFAULT_PROFILE_ID,
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

  const getOpenInProfileCommand = (profile: string) => `
    set profile to quoted form of "${profile}"
    set link to quoted form of "${url ? url : query ? "https://google.com/search?q=" + query : "about:blank"}"
    do shell script "open -na '${getApplicationName()}' --args --profile-directory=" & profile & " " & link
  `;

  switch (openTabInProfile) {
    case SettingsProfileOpenBehaviour.Default:
      script = getOpenInProfileCommand(DEFAULT_PROFILE_ID);
      break;
    case SettingsProfileOpenBehaviour.ProfileCurrent:
      script = getOpenInProfileCommand(profileCurrent);
      break;
    case SettingsProfileOpenBehaviour.ProfileOriginal:
      script = getOpenInProfileCommand(profileOriginal);
      break;
  }

  return await runAppleScript(script);
}

export async function setActiveTab(tab: Tab): Promise<void> {
  await runAppleScript(`
    tell application "${getApplicationName()}"
      activate

      -- this iteration finds the window that has the target tab and brings that to front
      set _targetURL to "${tab.url}"
      repeat with w in windows
        set _tab_index to 1
        repeat with t in tabs of w
          if URL of t is equal to _targetURL then
            set index of w to 1
            exit repeat
          end if
          set _tab_index to _tab_index + 1
        end repeat
        if URL of active tab of w is equal to _targetURL then
          exit repeat
        end if
      end repeat

      -- this iteration activates the target Tab in the active window
      repeat with w in windows
        set _tab_index to 1
        repeat with t in tabs of w
          if URL of t is equal to _targetURL then
            set active tab index of w to _tab_index
            exit repeat
          end if
          set _tab_index to _tab_index + 1
        end repeat
        if URL of active tab of w is equal to _targetURL then
          exit repeat
        end if
      end repeat
    end tell
  `);
}
// TODO: Search tabs shows incorrect message when Dev build is not installed
// TODO: Multiple profiles cache creates problem after new browser installation which has one default profile
// TODO: New Tab command revalidate doesn't work when profile is changed
// TODO: Search Tab command doesn't show profile selection
// TODO: Allow Beta and Canary builds support
// TODO: Fix all https://github.com/raycast/extensions/issues?q=is%3Aissue+microsoft+edge+ issues
// TODO: See if new features can be added to the extension like sidebar, vertical tabs, etc.
// TODO: Remove console.log statements
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
