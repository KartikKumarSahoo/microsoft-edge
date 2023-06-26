import { ApplicationType } from "../types/enums";
import { getPreferenceValues } from "@raycast/api";
import { Preferences } from "../types/interfaces";

const { useDev } = getPreferenceValues<Preferences>();

export function getApplicationType() {
  return useDev ? ApplicationType.EdgeDev : ApplicationType.EdgeStable;
}

export function getApplicationName(applicationType: ApplicationType = getApplicationType()) {
  switch (applicationType) {
    case ApplicationType.EdgeDev:
      return "Microsoft Edge Dev";
    case ApplicationType.EdgeBeta:
      return "Microsoft Edge Beta";
    case ApplicationType.EdgeCanary:
      return "Microsoft Edge Canary";
    case ApplicationType.EdgeStable:
    default:
      return "Microsoft Edge";
  }
}

export function getApplicationCaskName(applicationType: ApplicationType = getApplicationType()) {
  switch (applicationType) {
    case ApplicationType.EdgeDev:
      return "microsoft-edge-dev";
    case ApplicationType.EdgeBeta:
      return "microsoft-edge-beta";
    case ApplicationType.EdgeCanary:
      return "microsoft-edge-canary";
    case ApplicationType.EdgeStable:
    default:
      return "microsoft-edge";
  }
}

export function getApplicationImage(applicationType: ApplicationType = getApplicationType()) {
  switch (applicationType) {
    case ApplicationType.EdgeDev:
      return "edge-dev.png";
    case ApplicationType.EdgeBeta:
      return "edge-beta.png";
    case ApplicationType.EdgeCanary:
      return "edge-canary.png";
    case ApplicationType.EdgeStable:
    default:
      return "edge-stable.png";
  }
}
