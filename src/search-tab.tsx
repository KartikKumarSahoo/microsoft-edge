import { getPreferenceValues, List } from "@raycast/api";
import { useEffect, useState } from "react";
import { Preferences, Tab } from "./types/interfaces";
import { getOpenTabs } from "./actions";
import { EdgeListItems, NotInstalledError, UnknownError } from "./components";
import { geNotInstalledMessage } from "./utils/messageUtils";

export default function Command() {
  const { useOriginalFavicon } = getPreferenceValues<Preferences>();
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [errorView, setErrorView] = useState<React.ReactNode | undefined>();

  useEffect(() => {
    async function getTabs() {
      try {
        setTabs(await getOpenTabs(useOriginalFavicon));
      } catch (error: unknown) {
        if (error instanceof Error && error.message === geNotInstalledMessage()) {
          setErrorView(<NotInstalledError />);
        } else {
          setErrorView(<UnknownError />);
        }
      }
    }
    getTabs();
  }, []);

  if (errorView) {
    return errorView as React.ReactElement;
  }

  return (
    <List isLoading={tabs.length === 0}>
      {tabs.map((tab) => (
        <EdgeListItems.TabList key={tab.key()} tab={tab} useOriginalFavicon={useOriginalFavicon} />
      ))}
    </List>
  );
}
