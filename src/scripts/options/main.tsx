import React from 'react';
import ReactDOM from 'react-dom';
import { GeneralSection } from './general-section';
import { InitialItemsProvider } from './initial-items';
import { SubscriptionSection } from './subscription-section';
import { SyncSection } from './sync-section';
import style from '!!raw-loader!extract-loader!css-loader!sass-loader!../../styles/options.scss';

const Main: React.FC = () => (
  <InitialItemsProvider>
    <div className="ub-main">
      <GeneralSection />
      <SyncSection />
      <SubscriptionSection />
    </div>
  </InitialItemsProvider>
);

export function main(): void {
  document.head.insertAdjacentHTML('beforeend', `<style>${style}</style>`);
  ReactDOM.render(<Main />, document.getElementById('mainRoot'));
}
