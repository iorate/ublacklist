import React, { useMemo } from 'react';
import icon from '../../icons/icon.svg';
import { browser } from '../browser';
import { Icon } from '../components/icon';
import { Indent } from '../components/indent';
import { Label, LabelWrapper, SubLabel } from '../components/label';
import { expandLinks } from '../components/link';
import { Link } from '../components/link';
import { Row, RowItem } from '../components/row';
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from '../components/section';
import { useClassName } from '../components/utilities';
import { translate } from '../locales';

export const AboutSection: React.VFC = () => {
  const version = useMemo(() => browser.runtime.getManifest().version, []);
  /* #if PRODUCTION
  const thirdPartyNoticesURL = useMemo(() => browser.runtime.getURL('third-party-notices.txt'), []);
  */
  // #endif
  const nameClassName = useClassName(
    () => ({
      fontSize: '1.5em',
    }),
    [],
  );
  return (
    <Section aria-labelledby="aboutSectionTitle" id="about">
      <SectionHeader>
        <SectionTitle id="aboutSectionTitle">{translate('options_aboutTitle')}</SectionTitle>
      </SectionHeader>
      <SectionBody>
        <SectionItem>
          <Row>
            <RowItem>
              <Indent depth={1.5}>
                <Icon iconSize="36px" url={icon} />
              </Indent>
            </RowItem>
            <RowItem expanded>
              <LabelWrapper>
                <Label className={nameClassName}>{translate('extensionName')}</Label>
                <SubLabel>{`${translate('options_aboutVersion')}: ${version}`}</SubLabel>
                <SubLabel>
                  {expandLinks(translate('options_aboutDocumentation'))}
                  {' / '}
                  <Link href="https://github.com/iorate/ublacklist/releases">
                    {translate('options_aboutReleaseNotes')}
                  </Link>
                  {' / '}
                  {expandLinks(translate('options_aboutPrivacyPolicy'))}
                  {
                    /* #if PRODUCTION
                  }
                  {' / '}
                  <Link href={thirdPartyNoticesURL}>
                    {translate('options_aboutThirdPartyNotices')}
                  </Link>
                  {
                    */
                    // #endif
                  }
                </SubLabel>
              </LabelWrapper>
            </RowItem>
          </Row>
        </SectionItem>
      </SectionBody>
    </Section>
  );
};
