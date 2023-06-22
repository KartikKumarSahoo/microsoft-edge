import { Detail, showToast, Toast } from "@raycast/api";
import { DEFAULT_ERROR_TITLE } from "../../constants";
import { getUnknownErrorText } from "../../utils/messageUtils";

export function UnknownError() {
  showToast(Toast.Style.Failure, DEFAULT_ERROR_TITLE, "Something happened while trying to run your command");

  return <Detail markdown={getUnknownErrorText()} />;
}
