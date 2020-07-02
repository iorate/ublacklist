import React from 'react';

export type SectionProps = {
  id: string;
  title: string;
};

export const Section: React.FC<Readonly<SectionProps>> = props => (
  <section id={props.id} className="section">
    <h1 className="title">{props.title}</h1>
    <div className="panel">{props.children}</div>
  </section>
);

export const SectionItem: React.FC = props => (
  <div className="ub-section-item panel-block">{props.children}</div>
);
