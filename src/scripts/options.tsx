import { FunctionComponent, h, render } from 'preact';
import { ContextProvider } from './options/context';
import { GeneralSection } from './options/general-section';
import { SubscriptionSection } from './options/subscription-section';
import { SyncSection } from './options/sync-section';
import { Baseline } from './components/baseline';
import { Container } from './components/container';
import { AutoThemeProvider } from './components/theme';

const Main: FunctionComponent = () => (
  <ContextProvider>
    <AutoThemeProvider>
      <Baseline>
        <Container>
          <GeneralSection />
          <SyncSection />
          <SubscriptionSection />
        </Container>
      </Baseline>
    </AutoThemeProvider>
  </ContextProvider>
);

function main(): void {
  render(<Main />, document.body.appendChild(document.createElement('div')));
}

main();
