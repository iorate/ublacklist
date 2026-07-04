import { createRoot } from "react-dom/client";
import { Baseline } from "../components/baseline.tsx";
import { Container } from "../components/container.tsx";
import { AutoThemeProvider } from "../components/theme.tsx";
import { translate } from "../shared/locales.ts";
import { AboutSection } from "./about-section.tsx";
import { AppearanceSection } from "./appearance-section.tsx";
import { BackupRestoreSection } from "./backup-restore-section.tsx";
import { GeneralSection } from "./general-section.tsx";
import { OptionsContextProvider } from "./options-context.tsx";
import { SubscriptionSection } from "./subscription-section.tsx";
import { SyncSection } from "./sync-section.tsx";

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
