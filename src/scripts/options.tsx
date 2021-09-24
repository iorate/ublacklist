import { FunctionComponent, h, render } from 'preact';
import { Baseline } from './components/baseline';
import { Container } from './components/container';
import { AutoThemeProvider } from './components/theme';
import { translate } from './locales';
import { AppearanceSection } from './options/appearance-section';
import { GeneralSection } from './options/general-section';
import { OptionsContextProvider } from './options/options-context';
import { SubscriptionSection } from './options/subscription-section';
import { SyncSection } from './options/sync-section';

const Options: FunctionComponent = () => (
  <OptionsContextProvider>
    <AutoThemeProvider>
      <Baseline>
        <Container>
          <GeneralSection />
          <AppearanceSection />
          <SyncSection />
          <SubscriptionSection />
        </Container>
      </Baseline>
    </AutoThemeProvider>
  </OptionsContextProvider>
);

function main(): void {
  document.documentElement.lang = translate('lang');
  render(<Options />, document.body.appendChild(document.createElement('div')));
}

main();
