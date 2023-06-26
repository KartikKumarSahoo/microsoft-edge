import { ReactNode, useCallback, useEffect, useState } from "react";
import { getOpenTabs } from "../actions";
import { SearchResult, Tab } from "../types/interfaces";
import { NotInstalledError, UnknownError } from "../components";
import { geNotInstalledMessage } from "../utils/messageUtils";

export function useTabSearch(query?: string): SearchResult<Tab> {
  const [data, setData] = useState<Tab[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [errorView, setErrorView] = useState<ReactNode | undefined>();

  const getTabs = useCallback(async () => {
    let tabs = await getOpenTabs();

    if (query) {
      tabs = tabs.filter(function (tab) {
        return (
          tab.title.toLowerCase().includes(query.toLowerCase()) ||
          tab.urlWithoutScheme().toLowerCase().includes(query.toLowerCase())
        );
      });
    }
    setData(tabs);
  }, [query]);

  useEffect(() => {
    getTabs()
      .then(() => setIsLoading(false))
      .catch((e) => {
        if (e.message === geNotInstalledMessage()) {
          setErrorView(<NotInstalledError />);
        } else {
          setErrorView(<UnknownError />);
        }
        setIsLoading(false);
      });
  }, [query]);

  return { data, isLoading, errorView, revalidate: getTabs };
}
