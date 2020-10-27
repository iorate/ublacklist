import { Fragment, FunctionComponent, VNode, h } from 'preact';

export type TextWithLinksProps = {
  text: string;
};

export const TextWithLinks: FunctionComponent<Readonly<TextWithLinksProps>> = props => {
  const children: (string | VNode)[] = [];
  const split = props.text.split(/\[([^\]]*)]\(([^)]*)\)/g);
  for (let i = 0; i < split.length; ++i) {
    if (i % 3 === 0) {
      children.push(split[i]);
    } else if (i % 3 === 1) {
      children.push(
        <a key={i} href={split[i + 1]} rel="noopener noreferrer" target="_blank">
          {split[i]}
        </a>,
      );
      ++i;
    }
  }
  return <>{children}</>;
};
