import { FunctionComponent, h, render } from 'preact';
import { GeneralSection } from './options/general-section';
import { OptionsContextProvider } from './options/options-context';
import { SubscriptionSection } from './options/subscription-section';
import { SyncSection } from './options/sync-section';
import { Baseline } from './components/baseline';
import { Container } from './components/container';
import { AutoThemeProvider } from './components/theme';

const Options: FunctionComponent = () => (
  <OptionsContextProvider>
    <AutoThemeProvider>
      <Baseline>
        <Container>
          <GeneralSection />
          <SyncSection />
          <SubscriptionSection />
        </Container>
      </Baseline>
    </AutoThemeProvider>
  </OptionsContextProvider>
);

function main(): void {
  render(<Options />, document.body.appendChild(document.createElement('div')));
}

main();
