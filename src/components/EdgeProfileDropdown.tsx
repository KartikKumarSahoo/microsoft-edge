import { List } from "@raycast/api";
import { useEffect } from "react";
import { useCachedPromise, useCachedState } from "@raycast/utils";
import { existsSync, promises } from "fs";
import { getLocalStatePath } from "../utils/pathUtils";
import { EdgeProfile } from "../types/interfaces";
import {
  DEFAULT_PROFILE_ID,
  CURRENT_PROFILE_CACHE_KEY,
  ALL_PROFILES_CACHE_KEY,
  DUMMY_PROFILE_NAME,
} from "../constants";

interface Props {
  onProfileSelected?: (profile: string) => void;
}

async function loadEdgeProfiles(): Promise<EdgeProfile[]> {
  const path = getLocalStatePath();
  if (!existsSync(path)) {
    return [{ name: DUMMY_PROFILE_NAME, id: DEFAULT_PROFILE_ID }];
  }

  const edgeState = await promises.readFile(path, "utf-8");
  const profiles = JSON.parse(edgeState).profile.info_cache;

  return Object.entries<{ user_name: string }>(profiles)
    .filter(([, val]) => !!val.user_name)
    .map(([key, val]) => ({
      name: val.user_name,
      id: key,
    }));
}

export default function EdgeProfileDropDown({ onProfileSelected }: Props) {
  const [selectedProfile, setSelectedProfile] = useCachedState<string>(CURRENT_PROFILE_CACHE_KEY, DEFAULT_PROFILE_ID);
  const [profiles, setProfiles] = useCachedState<EdgeProfile[]>(ALL_PROFILES_CACHE_KEY, [
    { name: DUMMY_PROFILE_NAME, id: DEFAULT_PROFILE_ID },
  ]);
  const { data: loadedProfiles } = useCachedPromise(loadEdgeProfiles);

  useEffect(() => {
    if (loadedProfiles) {
      console.log("Loaded profiles", loadedProfiles);
      setProfiles(loadedProfiles);
      if (!selectedProfile) {
        setSelectedProfile(profiles[0].id);
      }
    }
  }, [loadedProfiles]);

  useEffect(() => {
    if (selectedProfile) {
      console.log("Selected profile", selectedProfile);
      onProfileSelected?.(selectedProfile);
    }
  }, [selectedProfile]);

  if (!profiles || profiles.length < 2) {
    return null;
  }

  return (
    <List.Dropdown tooltip="Select Edge Profile" value={selectedProfile} onChange={setSelectedProfile}>
      {profiles.map((profile) => (
        <List.Dropdown.Item key={profile.id} value={profile.id} title={profile.name} />
      ))}
    </List.Dropdown>
  );
}
