import { Fragment, FunctionComponent, h } from 'preact';
import { useLayoutEffect, useMemo, useRef, useState } from 'preact/hooks';
import icon from './icon.svg';
import { Blacklist } from './blacklist';
import { Baseline, ScopedBaseline } from './components/baseline';
import { Button, LinkButton } from './components/button';
import { Details, DetailsBody, DetailsSummary } from './components/details';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  NativeDialog,
} from './components/dialog';
import { Icon } from './components/icon';
import { Input } from './components/input';
import { Label, LabelItem } from './components/label';
import { expandLinks } from './components/link';
import { Row, RowItem } from './components/row';
import { StylesProvider, useCSS } from './components/styles';
import { ReadOnlyTextArea, TextArea } from './components/textarea';
import { sendMessage } from './messages';
import { PathDepth } from './path-depth';
import { AltURL, translate } from './utilities';
import { useTheme } from './components/theme';

type BlockDialogContentProps = {
  open: boolean;
  close: () => void;
  blacklist: Blacklist;
  enablePathDepth: boolean;
  url: string;
  onBlocked(): void | Promise<void>;
};

const BlockDialogContent: FunctionComponent<BlockDialogContentProps> = props => {
  const prevOpen = useRef(false);
  const [disabled, setDisabled] = useState(false);
  const [unblock, setUnblock] = useState(false);
  const [host, setHost] = useState('');
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [pathDepth, setPathDepth] = useState<PathDepth | null>(null);
  const [depth, setDepth] = useState('');
  const [rulesToAdd, setRulesToAdd] = useState('');
  const [rulesToAddValid, setRulesToAddValid] = useState(false);
  const [rulesToRemove, setRulesToRemove] = useState('');
  useLayoutEffect(() => {
    if (props.open && !prevOpen.current) {
      const url = new AltURL(props.url);
      if (/^(https?|ftp)$/.test(url.scheme)) {
        const patch = props.blacklist.createPatch(url);
        setDisabled(false);
        setUnblock(patch.unblock);
        setHost(url.host);
        setDetailsOpen(false);
        setPathDepth(props.enablePathDepth ? new PathDepth(url) : null);
        setDepth('0');
        setRulesToAdd(patch.rulesToAdd);
        setRulesToAddValid(true);
        setRulesToRemove(patch.rulesToRemove);
      } else {
        setDisabled(true);
        setUnblock(false);
        setHost(props.url);
        setDetailsOpen(false);
        setPathDepth(null);
        setDepth('');
        setRulesToAdd('');
        setRulesToAddValid(false);
        setRulesToRemove('');
      }
    }
    prevOpen.current = props.open;
  }, [props.open, props.url, props.blacklist, props.enablePathDepth]);
  const ok = !disabled && rulesToAddValid;

  const css = useCSS();
  const theme = useTheme();
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
        <DialogTitle>
          <Row>
            <RowItem>
              <Icon color={theme.text.primary} iconSize="24px" url={icon} />
            </RowItem>
            <RowItem expanded>
              {translate(unblock ? 'popup_unblockSiteTitle' : 'popup_blockSiteTitle')}
            </RowItem>
          </Row>
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem expanded>
            <span class={hostClass}>{host}</span>
          </RowItem>
        </Row>
        <Row>
          <RowItem expanded>
            <Details
              open={detailsOpen}
              onToggle={e => {
                setDetailsOpen(e.currentTarget.open);
              }}
            >
              <DetailsSummary class="js-focus-start">{translate('popup_details')}</DetailsSummary>
              <DetailsBody>
                <Row>
                  <RowItem expanded>
                    <Label forFullWidth>
                      <LabelItem primary>{translate('popup_pageURLLabel')}</LabelItem>
                    </Label>
                    <ReadOnlyTextArea breakAll rows={2} value={props.url} />
                  </RowItem>
                </Row>
                {props.enablePathDepth && (
                  <Row>
                    <RowItem expanded>
                      <Label disabled={disabled} forFullWidth>
                        <LabelItem primary>{translate('popup_pathDepth')}</LabelItem>
                      </Label>
                      <Input
                        disabled={disabled}
                        max={pathDepth?.maxDepth() ?? 0}
                        min={0}
                        type="number"
                        value={depth}
                        onInput={e => {
                          const newDepth = e.currentTarget.value;
                          setDepth(newDepth);
                          if (!pathDepth || !newDepth || !e.currentTarget.validity.valid) {
                            return;
                          }
                          const newRulesToAdd = pathDepth.suggestMatchPattern(
                            Number(newDepth),
                            unblock,
                          );
                          setRulesToAdd(newRulesToAdd);
                          const newPatch = props.blacklist.modifyPatch({
                            rulesToAdd: newRulesToAdd,
                          });
                          setRulesToAddValid(Boolean(newPatch));
                        }}
                      />
                    </RowItem>
                  </Row>
                )}
                <Row>
                  <RowItem expanded>
                    <Label disabled={disabled} forFullWidth>
                      <LabelItem primary>{translate('popup_addedRulesLabel')}</LabelItem>
                      <LabelItem>
                        {expandLinks(translate('options_blacklistHelper'), disabled)}
                      </LabelItem>
                    </Label>
                    <TextArea
                      breakAll
                      disabled={disabled}
                      rows={2}
                      value={rulesToAdd}
                      onInput={e => {
                        const newRulesToAdd = e.currentTarget.value;
                        setRulesToAdd(newRulesToAdd);
                        const newPatch = props.blacklist.modifyPatch({
                          rulesToAdd: newRulesToAdd,
                        });
                        setRulesToAddValid(Boolean(newPatch));
                      }}
                    />
                  </RowItem>
                </Row>
                <Row>
                  <RowItem expanded>
                    <Label disabled={disabled} forFullWidth>
                      <LabelItem primary>{translate('popup_removedRulesLabel')}</LabelItem>
                    </Label>
                    <ReadOnlyTextArea breakAll disabled={disabled} rows={2} value={rulesToRemove} />
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
            <LinkButton
              onClick={() => {
                void (async () => {
                  await sendMessage('open-options-page');
                  props.close();
                })();
              }}
            >
              {translate('popup_openOptionsLink')}
            </LinkButton>
          </RowItem>
          <RowItem>
            <Row>
              <RowItem>
                <Button
                  class={!ok ? 'js-focus-end' : undefined}
                  onClick={() => {
                    props.close();
                  }}
                >
                  {translate('cancelButton')}
                </Button>
              </RowItem>
              <RowItem>
                <Button
                  class={ok ? 'js-focus-end' : undefined}
                  disabled={!ok}
                  primary
                  onClick={async () => {
                    props.blacklist.applyPatch();
                    await Promise.resolve(props.onBlocked());
                    props.close();
                  }}
                >
                  {translate(unblock ? 'popup_unblockSiteButton' : 'popup_blockSiteButton')}
                </Button>
              </RowItem>
            </Row>
          </RowItem>
        </Row>
      </DialogFooter>
    </>
  );
};

export type BlockDialogProps = { target: HTMLElement | ShadowRoot } & BlockDialogContentProps;

export const BlockDialog: FunctionComponent<BlockDialogProps> = ({ target, ...props }) => (
  <StylesProvider target={target}>
    <ScopedBaseline>
      <Dialog close={props.close} open={props.open} width="360px">
        <BlockDialogContent {...props} />
      </Dialog>
    </ScopedBaseline>
  </StylesProvider>
);

export type BlockPopupProps = BlockDialogContentProps;

export const BlockPopup: FunctionComponent<BlockPopupProps> = props => (
  <Baseline>
    <NativeDialog close={props.close} width="360px">
      <BlockDialogContent {...props} />
    </NativeDialog>
  </Baseline>
);
