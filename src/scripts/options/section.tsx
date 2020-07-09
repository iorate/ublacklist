import { FunctionComponent, h } from 'preact';

export type SectionProps = {
  id: string;
  title: string;
};

export const Section: FunctionComponent<Readonly<SectionProps>> = props => (
  <section id={props.id} class="section">
    <h1 class="title">{props.title}</h1>
    <div class="panel">{props.children}</div>
  </section>
);

export const SectionItem: FunctionComponent = props => (
  <div class="ub-section-item panel-block">{props.children}</div>
);
