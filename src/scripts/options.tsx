import { createRoot } from "react-dom/client";
import { Baseline } from "./components/baseline.tsx";
import { Container } from "./components/container.tsx";
import { AutoThemeProvider } from "./components/theme.tsx";
import { translate } from "./locales.ts";
import { AboutSection } from "./options/about-section.tsx";
import { AppearanceSection } from "./options/appearance-section.tsx";
import { BackupRestoreSection } from "./options/backup-restore-section.tsx";
import { GeneralSection } from "./options/general-section.tsx";
import { OptionsContextProvider } from "./options/options-context.tsx";
import { SubscriptionSection } from "./options/subscription-section.tsx";
import { SyncSection } from "./options/sync-section.tsx";

const Options: React.FC = () => (
  <AutoThemeProvider>
    <Baseline>
      <OptionsContextProvider>
        <Container>
          {/* biome-ignore-start lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
          <GeneralSection id="general" />
          <AppearanceSection id="appearance" />
          <SyncSection id="sync" />
          <SubscriptionSection id="subscription" />
          <BackupRestoreSection id="backup-restore" />
          <AboutSection id="about" />
          {/* biome-ignore-end lint/correctness/useUniqueElementIds: IDs are intentionally hardcoded for URL fragment navigation */}
        </Container>
      </OptionsContextProvider>
    </Baseline>
  </AutoThemeProvider>
);

function main(): void {
  document.documentElement.lang = translate("lang");
  const root = createRoot(
    document.body.appendChild(document.createElement("div")),
  );
  root.render(<Options />);
}

main();
