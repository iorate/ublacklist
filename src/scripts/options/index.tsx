import containerStyles from "../styles/container.module.css";
import "../styles/theme.css";
import "../styles/baseline.css";
import { createRoot } from "react-dom/client";
import { AutoThemeProvider } from "../components/theme.tsx";
import { browser } from "../shared/browser.ts";
import { translate } from "../shared/locales.ts";
import { storageStore } from "../shared/storage-store.ts";
import { AboutSection } from "./about-section.tsx";
import { AppearanceSection } from "./appearance-section.tsx";
import { BackupRestoreSection } from "./backup-restore-section.tsx";
import { GeneralSection } from "./general-section.tsx";
import { initializePlatform } from "./shared/platform.ts";
import {
  type OptionsQuery,
  SubscriptionSection,
} from "./subscription-section.ts";
import { SyncSection } from "./sync-section.tsx";

function Options({ query }: { query: OptionsQuery }) {
  return (
    <AutoThemeProvider>
      <div className={containerStyles.wrapper}>
        <div className={containerStyles.container}>
          {/* biome-ignore-start lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
          <GeneralSection id="general" />
          <AppearanceSection id="appearance" />
          <SyncSection id="sync" />
          <SubscriptionSection id="subscription" query={query} />
          <BackupRestoreSection id="backup-restore" />
          <AboutSection id="about" />
          {/* biome-ignore-end lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
        </div>
      </div>
    </AutoThemeProvider>
  );
}

async function main(): Promise<void> {
  document.documentElement.lang = translate("lang");

  const [, platformInfo] = await Promise.all([
    storageStore.attachPromise,
    browser.runtime.getPlatformInfo(),
  ]);
  initializePlatform(platformInfo);

  const here = new URL(window.location.href);
  const searchParams = here.searchParams;
  const typeParam = searchParams.get("type");
  const query: OptionsQuery = {
    addSubscriptionName:
      searchParams.get("addSubscriptionName") ?? searchParams.get("name"),
    addSubscriptionURL:
      searchParams.get("addSubscriptionURL") ?? searchParams.get("url"),
    addSubscriptionType:
      typeParam === "ruleset" || typeParam === "domains" ? typeParam : null,
  };
  here.search = "";
  history.replaceState(null, "", here);

  const root = createRoot(
    document.body.appendChild(document.createElement("div")),
  );
  root.render(<Options query={query} />);
}

void main();
