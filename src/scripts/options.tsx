import React from 'react';
import ReactDOM from 'react-dom';
import { Baseline } from './components/baseline';
import { Container } from './components/container';
import { AutoThemeProvider } from './components/theme';
import { translate } from './locales';
import { AboutSection } from './options/about-section';
import { AppearanceSection } from './options/appearance-section';
import { GeneralSection } from './options/general-section';
import { OptionsContextProvider } from './options/options-context';
import { SubscriptionSection } from './options/subscription-section';
import { SyncSection } from './options/sync-section';

const Options: React.VFC = () => (
  <AutoThemeProvider>
    <Baseline>
      <OptionsContextProvider>
        <Container>
          <GeneralSection />
          <AppearanceSection />
          <SyncSection />
          <SubscriptionSection />
          <AboutSection />
        </Container>
      </OptionsContextProvider>
    </Baseline>
  </AutoThemeProvider>
);

function main(): void {
  document.documentElement.lang = translate('lang');
  ReactDOM.render(<Options />, document.body.appendChild(document.createElement('div')));
}

main();
