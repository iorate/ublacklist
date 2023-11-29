import * as mpsl from 'mpsl';
import * as punycode from 'punycode/';
import React, { useState } from 'react';
import icon from '../icons/icon.svg';
import { ScopedBaseline } from './components/baseline';
import { Button, LinkButton } from './components/button';
import { FOCUS_DEFAULT_CLASS, FOCUS_END_CLASS, FOCUS_START_CLASS } from './components/constants';
import { Details, DetailsBody, DetailsSummary } from './components/details';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  EmbeddedDialog,
} from './components/dialog';
import { Icon } from './components/icon';
import { Input } from './components/input';
import { ControlLabel, LabelWrapper } from './components/label';
import { Row, RowItem } from './components/row';
import { StylesProvider } from './components/styles';
import { TextArea } from './components/textarea';
import { ThemeProvider, darkTheme, lightTheme } from './components/theme';
import { useClassName, usePrevious } from './components/utilities';
import { InteractiveRuleset } from './interactive-ruleset';
import { translate } from './locales';
import { PathDepth } from './path-depth';
import { DialogTheme } from './types';
import { makeAltURL } from './utilities';

type BlockDialogContentProps = {
  blockWholeSite: boolean;
  close: () => void;
  enablePathDepth: boolean;
  open: boolean;
  openOptionsPage: () => Promise<void>;
  ruleset: InteractiveRuleset;
  title: string | null;
  url: string;
  onBlocked: () => void | Promise<void>;
};

const BlockDialogContent: React.VFC<BlockDialogContentProps> = ({
  blockWholeSite,
  close,
  enablePathDepth,
  open,
  openOptionsPage,
  ruleset,
  title,
  url: entryURL,
  onBlocked,
}) => {
  const [state, setState] = useState({
    disabled: false,
    unblock: false,
    host: '',
    detailsOpen: false,
    pathDepth: null as PathDepth | null,
    depth: '',
    rulesToAdd: '',
    rulesToAddValid: false,
    rulesToRemove: '',
  });
  const prevOpen = usePrevious(open);
  if (open && !prevOpen) {
    const url = makeAltURL(entryURL);
    if (url && /^(https?|ftp)$/.test(url.scheme)) {
      const patch = ruleset.createPatch({ url, title }, blockWholeSite);
      state.disabled = false;
      state.unblock = patch.unblock;
      state.host = punycode.toUnicode(blockWholeSite ? mpsl.get(url.host) ?? url.host : url.host);
      state.detailsOpen = false;
      state.pathDepth = enablePathDepth ? new PathDepth(url) : null;
      state.depth = '0';
      state.rulesToAdd = patch.rulesToAdd;
      state.rulesToAddValid = true;
      state.rulesToRemove = patch.rulesToRemove;
    } else {
      state.disabled = true;
      state.unblock = false;
      state.host = entryURL;
      state.detailsOpen = false;
      state.pathDepth = null;
      state.depth = '';
      state.rulesToAdd = '';
      state.rulesToAddValid = false;
      state.rulesToRemove = '';
    }
  }
  const ok = !state.disabled && state.rulesToAddValid;

  const hostClass = useClassName(
    () => ({
      wordBreak: 'break-all',
    }),
    [],
  );

  return (
    <>
      <DialogHeader>
        <DialogTitle id="title">
          <Row>
            <RowItem>
              <Icon iconSize="24px" url={icon} />
            </RowItem>
            <RowItem expanded>
              {translate(state.unblock ? 'popup_unblockSiteTitle' : 'popup_blockSiteTitle')}
            </RowItem>
          </Row>
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <span className={hostClass}>{state.host}</span>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Details
              open={state.detailsOpen}
              onToggle={e =>
                setState(s => ({ ...s, detailsOpen: (e.currentTarget as HTMLDetailsElement).open }))
              }
            >
              <DetailsSummary className={FOCUS_START_CLASS}>
                {translate('popup_details')}
              </DetailsSummary>
              <DetailsBody>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper fullWidth>
                      <ControlLabel for="url">{translate('popup_pageURLLabel')}</ControlLabel>
                    </LabelWrapper>
                    {open && <TextArea breakAll id="url" readOnly rows={2} value={entryURL} />}
                  </RowItem>
                </Row>
                {enablePathDepth && (
                  <Row>
                    <RowItem expanded>
                      <LabelWrapper disabled={state.disabled} fullWidth>
                        <ControlLabel for="depth">{translate('popup_pathDepth')}</ControlLabel>
                      </LabelWrapper>
                      {open && (
                        <Input
                          disabled={state.disabled}
                          id="depth"
                          max={state.pathDepth?.maxDepth() ?? 0}
                          min={0}
                          type="number"
                          value={state.depth}
                          onChange={e => {
                            const depth = e.currentTarget.value;
                            if (!state.pathDepth || !depth || !e.currentTarget.validity.valid) {
                              setState(s => ({ ...s, depth }));
                              return;
                            }
                            const rulesToAdd = state.pathDepth.suggestMatchPattern(
                              Number(depth),
                              state.unblock,
                            );
                            const patch = ruleset.modifyPatch({ rulesToAdd });
                            setState(s => ({
                              ...s,
                              depth,
                              rulesToAdd,
                              rulesToAddValid: Boolean(patch),
                            }));
                          }}
                        />
                      )}
                    </RowItem>
                  </Row>
                )}
                <Row>
                  <RowItem expanded>
                    <LabelWrapper fullWidth>
                      <ControlLabel for="pageTitle">
                        {translate('popup_pageTitleLabel')}
                      </ControlLabel>
                    </LabelWrapper>
                    <TextArea
                      id="pageTitle"
                      readOnly
                      rows={2}
                      spellCheck="false"
                      value={title ?? ''}
                    />
                  </RowItem>
                </Row>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper disabled={state.disabled} fullWidth>
                      <ControlLabel for="rulesToAdd">
                        {translate('popup_addedRulesLabel')}
                      </ControlLabel>
                    </LabelWrapper>
                    {open && (
                      <TextArea
                        breakAll
                        disabled={state.disabled}
                        id="rulesToAdd"
                        rows={2}
                        spellCheck="false"
                        value={state.rulesToAdd}
                        onChange={e => {
                          const rulesToAdd = e.currentTarget.value;
                          const patch = ruleset.modifyPatch({ rulesToAdd });
                          setState(s => ({ ...s, rulesToAdd, rulesToAddValid: Boolean(patch) }));
                        }}
                      />
                    )}
                  </RowItem>
                </Row>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper disabled={state.disabled} fullWidth>
                      <ControlLabel for="rulesToRemove">
                        {translate('popup_removedRulesLabel')}
                      </ControlLabel>
                    </LabelWrapper>
                    {open && (
                      <TextArea
                        breakAll
                        disabled={state.disabled}
                        id="rulesToRemove"
                        readOnly
                        rows={2}
                        value={state.rulesToRemove}
                      />
                    )}
                  </RowItem>
                </Row>
              </DetailsBody>
            </Details>
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row multiline right>
          <RowItem expanded>
            <LinkButton onClick={openOptionsPage}>{translate('popup_openOptionsLink')}</LinkButton>
          </RowItem>
          <RowItem>
            <Row>
              <RowItem>
                <Button className={!ok ? FOCUS_END_CLASS : ''} onClick={close}>
                  {translate('cancelButton')}
                </Button>
              </RowItem>
              <RowItem>
                <Button
                  className={ok ? `${FOCUS_END_CLASS} ${FOCUS_DEFAULT_CLASS}` : FOCUS_DEFAULT_CLASS}
                  disabled={!ok}
                  primary
                  onClick={async () => {
                    ruleset.applyPatch();
                    await Promise.resolve(onBlocked());
                    close();
                  }}
                >
                  {translate(state.unblock ? 'popup_unblockSiteButton' : 'popup_blockSiteButton')}
                </Button>
              </RowItem>
            </Row>
          </RowItem>
        </Row>
      </DialogFooter>
    </>
  );
};

export type BlockDialogProps = {
  target: HTMLElement | ShadowRoot;
  theme: DialogTheme;
} & BlockDialogContentProps;

export const BlockDialog: React.VFC<BlockDialogProps> = ({ target, theme, ...props }) => (
  <StylesProvider target={target}>
    <ThemeProvider theme={theme === 'light' ? lightTheme : darkTheme}>
      <ScopedBaseline>
        <Dialog aria-labelledby="title" close={props.close} open={props.open} width="360px">
          <BlockDialogContent {...props} />
        </Dialog>
      </ScopedBaseline>
    </ThemeProvider>
  </StylesProvider>
);

export type BlockEmbeddedDialogProps = Omit<BlockDialogContentProps, 'open'>;

export const BlockEmbeddedDialog: React.VFC<BlockEmbeddedDialogProps> = props => (
  <EmbeddedDialog close={props.close} width="360px">
    <BlockDialogContent open={true} {...props} />
  </EmbeddedDialog>
);
