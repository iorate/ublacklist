import { Fragment, FunctionComponent, h } from 'preact';
import { useMemo, useState } from 'preact/hooks';
import icon from '../icons/icon.svg';
import { Blacklist } from './blacklist';
import { Baseline, ScopedBaseline } from './components/baseline';
import { Button, LinkButton } from './components/button';
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from './components/constants';
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
import { ControlLabel, LabelWrapper, SubLabel } from './components/label';
import { expandLinks } from './components/link';
import { Row, RowItem } from './components/row';
import { StylesProvider, useCSS } from './components/styles';
import { TextArea } from './components/textarea';
import { AutoThemeProvider, ThemeProvider, darkTheme, lightTheme } from './components/theme';
import { usePrevious } from './components/utilities';
import { sendMessage } from './messages';
import { PathDepth } from './path-depth';
import { DialogTheme } from './types';
import { AltURL, translate } from './utilities';

type BlockDialogContentProps = {
  blacklist: Blacklist;
  close: () => void;
  enablePathDepth: boolean;
  open: boolean;
  url: string;
  onBlocked: () => void | Promise<void>;
};

const BlockDialogContent: FunctionComponent<BlockDialogContentProps> = ({
  blacklist,
  close,
  enablePathDepth,
  open,
  url,
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
    let u: AltURL | null = null;
    try {
      u = new AltURL(url);
    } catch {
      // NOP
    }
    if (u && /^(https?|ftp)$/.test(u.scheme)) {
      const patch = blacklist.createPatch(u);
      state.disabled = false;
      state.unblock = patch.unblock;
      state.host = u.host;
      state.detailsOpen = false;
      state.pathDepth = enablePathDepth ? new PathDepth(u) : null;
      state.depth = '0';
      state.rulesToAdd = patch.rulesToAdd;
      state.rulesToAddValid = true;
      state.rulesToRemove = patch.rulesToRemove;
    } else {
      state.disabled = true;
      state.unblock = false;
      state.host = url;
      state.detailsOpen = false;
      state.pathDepth = null;
      state.depth = '';
      state.rulesToAdd = '';
      state.rulesToAddValid = false;
      state.rulesToRemove = '';
    }
  }
  const ok = !state.disabled && state.rulesToAddValid;

  const css = useCSS();
  const hostClass = useMemo(
    () =>
      css({
        wordBreak: 'break-all',
      }),
    [css],
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
            <span class={hostClass}>{state.host}</span>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Details
              open={state.detailsOpen}
              onToggle={e => setState(s => ({ ...s, detailsOpen: e.currentTarget.open }))}
            >
              <DetailsSummary class={FOCUS_START_CLASS}>
                {translate('popup_details')}
              </DetailsSummary>
              <DetailsBody>
                <Row>
                  <RowItem expanded>
                    <LabelWrapper fullWidth>
                      <ControlLabel for="url">{translate('popup_pageURLLabel')}</ControlLabel>
                    </LabelWrapper>
                    {open && <TextArea breakAll id="url" readOnly rows={2} value={url} />}
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
                          onInput={e => {
                            const depth = e.currentTarget.value;
                            if (!state.pathDepth || !depth || !e.currentTarget.validity.valid) {
                              setState(s => ({ ...s, depth }));
                              return;
                            }
                            const rulesToAdd = state.pathDepth.suggestMatchPattern(
                              Number(depth),
                              state.unblock,
                            );
                            const patch = blacklist.modifyPatch({ rulesToAdd });
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
                    <LabelWrapper disabled={state.disabled} fullWidth>
                      <ControlLabel for="rulesToAdd">
                        {translate('popup_addedRulesLabel')}
                      </ControlLabel>
                      <SubLabel>
                        {expandLinks(translate('options_blacklistHelper'), state.disabled)}
                      </SubLabel>
                    </LabelWrapper>
                    {open && (
                      <TextArea
                        breakAll
                        disabled={state.disabled}
                        id="rulesToAdd"
                        rows={2}
                        spellcheck={false}
                        value={state.rulesToAdd}
                        onInput={e => {
                          const rulesToAdd = e.currentTarget.value;
                          const patch = blacklist.modifyPatch({ rulesToAdd });
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
            <LinkButton onClick={() => sendMessage('open-options-page')}>
              {translate('popup_openOptionsLink')}
            </LinkButton>
          </RowItem>
          <RowItem>
            <Row>
              <RowItem>
                <Button class={!ok ? FOCUS_END_CLASS : undefined} onClick={close}>
                  {translate('cancelButton')}
                </Button>
              </RowItem>
              <RowItem>
                <Button
                  class={ok ? FOCUS_END_CLASS : undefined}
                  disabled={!ok}
                  primary
                  onClick={async () => {
                    blacklist.applyPatch();
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

export const BlockDialog: FunctionComponent<BlockDialogProps> = ({ target, theme, ...props }) => (
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

export type BlockPopupProps = Omit<BlockDialogContentProps, 'open'>;

export const BlockPopup: FunctionComponent<BlockPopupProps> = props => (
  <AutoThemeProvider>
    <Baseline>
      <EmbeddedDialog close={props.close} width="360px">
        <BlockDialogContent open={true} {...props} />
      </EmbeddedDialog>
    </Baseline>
  </AutoThemeProvider>
);
