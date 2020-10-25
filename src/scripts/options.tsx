import { FunctionComponent, h, render } from 'preact';
import { ContextProvider } from './options/context';
import { GeneralSection } from './options/general-section';
import { SubscriptionSection } from './options/subscription-section';
import { SyncSection } from './options/sync-section';
import optionsStyle from '../styles/options.scss';

const Main: FunctionComponent = () => (
  <div class="ub-main">
    <ContextProvider>
      <GeneralSection />
      <SyncSection />
      <SubscriptionSection />
    </ContextProvider>
  </div>
);

function main(): void {
  render(optionsStyle, document.head.appendChild(document.createElement('style')));
  render(<Main />, document.body.appendChild(document.createElement('div')));
}

main();
