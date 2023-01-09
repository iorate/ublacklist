import * as S from 'microstruct';
import React, { useState } from 'react';
import { browser } from '../browser';
import { Button } from '../components/button';
import { Label, LabelWrapper, SubLabel } from '../components/label';
import { Row, RowItem } from '../components/row';
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from '../components/section';
import { translate } from '../locales';
import { sendMessage } from '../messages';
import { LocalStorageItemsBackupRestore } from '../types';
import { downloadTextFile, uploadTextFile } from '../utilities';

export const BackupRestoreSection: React.VFC = () => {
  const [fileInvalid, setFileInvalid] = useState(false);

  return (
    <Section aria-labelledby="backupRestoreSectionTitle" id="backupRestore">
      <SectionHeader>
        <SectionTitle id="backupRestoreSectionTitle">
          {translate('options_backupRestoreTitle')}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <Label>{translate('options_backupSettingsLabel')}</Label>
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Button
                onClick={async () => {
                  const items = await sendMessage('backup-settings');
                  downloadTextFile(
                    'ublacklist-settings.json',
                    'application/json',
                    JSON.stringify(
                      { ...items, version: browser.runtime.getManifest().version },
                      null,
                      2,
                    ),
                  );
                }}
              >
                {translate('options_backupSettingsButton')}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <Label>{translate('options_restoreSettingsLabel')}</Label>
                {fileInvalid && (
                  <SubLabel>
                    {translate('error', translate('options_restoreSettingsInvalidFile'))}
                  </SubLabel>
                )}
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Button
                onClick={async () => {
                  const text = await uploadTextFile('application/json');
                  if (text == null) {
                    return;
                  }
                  const items = S.parse(
                    text,
                    S.type({
                      blacklist: S.optional(S.string()),
                      blockWholeSite: S.optional(S.boolean()),
                      skipBlockDialog: S.optional(S.boolean()),
                      hideBlockLinks: S.optional(S.boolean()),
                      hideControl: S.optional(S.boolean()),
                      enablePathDepth: S.optional(S.boolean()),
                      linkColor: S.optional(S.string()),
                      blockColor: S.optional(S.string()),
                      highlightColors: S.optional(S.array(S.string())),
                      dialogTheme: S.optional(S.enums(['light', 'dark', 'default'] as const)),
                      syncBlocklist: S.optional(S.boolean()),
                      syncGeneral: S.optional(S.boolean()),
                      syncAppearance: S.optional(S.boolean()),
                      syncSubscriptions: S.optional(S.boolean()),
                      syncInterval: S.optional(S.number()),
                      subscriptions: S.optional(
                        S.array(
                          S.type({ name: S.string(), url: S.string(), enabled: S.boolean() }),
                        ),
                      ),
                      updateInterval: S.optional(S.number()),
                      version: S.optional(S.string()),
                    }),
                  );
                  setFileInvalid(!items);
                  if (!items) {
                    return;
                  }
                  await sendMessage(
                    'restore-settings',
                    items as Partial<LocalStorageItemsBackupRestore>,
                  );
                  // Reload without query parameters
                  window.location.assign(window.location.pathname);
                }}
              >
                {translate('options_restoreSettingsButton')}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
        <SectionItem>
          <Row>
            <RowItem expanded>
              <LabelWrapper>
                <Label>{translate('options_initializeSettingsLabel')}</Label>
              </LabelWrapper>
            </RowItem>
            <RowItem>
              <Button
                onClick={async () => {
                  const confirmed = window.confirm(
                    translate('options_initializeSettingsConfirmation'),
                  );
                  if (!confirmed) {
                    return;
                  }
                  await sendMessage('initialize-settings');
                  // Reload without query parameters
                  window.location.assign(window.location.pathname);
                }}
              >
                {translate('options_initializeSettingsButton')}
              </Button>
            </RowItem>
          </Row>
        </SectionItem>
      </SectionBody>
    </Section>
  );
};
