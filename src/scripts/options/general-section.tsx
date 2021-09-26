import { FunctionComponent, h } from 'preact';
import { StateUpdater, useEffect, useState } from 'preact/hooks';
import { searchEngineMatches } from '../../common/search-engines';
import { apis } from '../apis';
import { Button, LinkButton } from '../components/button';
import { CheckBox } from '../components/checkbox';
import { FOCUS_END_CLASS, FOCUS_START_CLASS } from '../components/constants';
import {
  Dialog,
  DialogBody,
  DialogFooter,
  DialogHeader,
  DialogProps,
  DialogTitle,
} from '../components/dialog';
import { Indent } from '../components/indent';
import { ControlLabel, Label, LabelWrapper, SubLabel } from '../components/label';
import { expandLinks } from '../components/link';
import { List, ListItem } from '../components/list';
import { Portal } from '../components/portal';
import { Row, RowItem } from '../components/row';
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from '../components/section';
import { Text } from '../components/text';
import { TextArea } from '../components/textarea';
import { usePrevious } from '../components/utilities';
import { saveToLocalStorage } from '../local-storage';
import { translate } from '../locales';
import { addMessageListeners, sendMessage } from '../messages';
import { searchEngineMessageNames } from '../search-engines/message-names';
import { MessageName0, SearchEngineId } from '../types';
import { lines, stringEntries } from '../utilities';
import { useOptionsContext } from './options-context';
import { Select, SelectOption } from './select';
import { SetBooleanItem } from './set-boolean-item';

const ImportBlacklistDialog: FunctionComponent<
  { setBlacklist: StateUpdater<string>; setBlacklistDirty: StateUpdater<boolean> } & DialogProps
> = ({ close, open, setBlacklist, setBlacklistDirty }) => {
  const [state, setState] = useState({
    source: 'file' as 'file' | 'pb',
    pb: '',
    append: false,
  });
  const prevOpen = usePrevious(open);
  if (open && !prevOpen) {
    state.source = 'file';
    state.pb = '';
    state.append = false;
  }
  const replaceOrAppend = (newBlacklist: string) => {
    if (state.append) {
      setBlacklist(
        oldBlacklist => `${oldBlacklist}${oldBlacklist && newBlacklist ? '\n' : ''}${newBlacklist}`,
      );
    } else {
      setBlacklist(() => newBlacklist);
    }
    setBlacklistDirty(true);
  };

  return (
    <Dialog aria-labelledby="importBlacklistDialogTitle" close={close} open={open}>
      <DialogHeader>
        <DialogTitle id="importBlacklistDialogTitle">
          {translate('options_importBlacklistDialog_title')}
        </DialogTitle>
      </DialogHeader>
      <DialogBody>
        <Row>
          <RowItem>
            <Select
              class={FOCUS_START_CLASS}
              value={state.source}
              onInput={e =>
                setState(s => ({ ...s, source: e.currentTarget.value as 'file' | 'pb' }))
              }
            >
              <SelectOption value="file">
                {translate('options_importBlacklistDialog_fromFile')}
              </SelectOption>
              <SelectOption value="pb">
                {translate('options_importBlacklistDialog_fromPB')}
              </SelectOption>
            </Select>
          </RowItem>
        </Row>
        {state.source === 'pb' && (
          <Row>
            <RowItem expanded>
              <LabelWrapper fullWidth>
                <SubLabel>{translate('options_importBlacklistDialog_helper')}</SubLabel>
                <SubLabel>{translate('options_blacklistExample', 'example.com')}</SubLabel>
              </LabelWrapper>
              <TextArea
                aria-label={translate('options_importBlacklistDialog_pbLabel')}
                rows={5}
                spellcheck={false}
                value={state.pb}
                wrap="off"
                onInput={e => setState(s => ({ ...s, pb: e.currentTarget.value }))}
              />
            </RowItem>
          </Row>
        )}
        <Row>
          <RowItem>
            <Indent>
              <CheckBox
                checked={state.append}
                id="append"
                onInput={e => setState(s => ({ ...s, append: e.currentTarget.checked }))}
              />
            </Indent>
          </RowItem>
          <RowItem expanded>
            <LabelWrapper>
              <ControlLabel for="append">
                {translate('options_importBlacklistDialog_append')}
              </ControlLabel>
            </LabelWrapper>
          </RowItem>
        </Row>
      </DialogBody>
      <DialogFooter>
        <Row right>
          <RowItem>
            <Button
              {...(state.source === 'pb' && !state.pb ? { class: FOCUS_END_CLASS } : {})}
              onClick={close}
            >
              {translate('cancelButton')}
            </Button>
          </RowItem>
          <RowItem>
            {state.source === 'file' ? (
              <Button
                class={FOCUS_END_CLASS}
                primary
                onClick={() => {
                  const fileInput = document.createElement('input');
                  fileInput.accept = 'text/plain';
                  fileInput.type = 'file';
                  fileInput.addEventListener('input', () => {
                    const file = fileInput.files?.[0];
                    if (!file) {
                      return;
                    }
                    const fileReader = new FileReader();
                    fileReader.addEventListener('load', () => {
                      replaceOrAppend(fileReader.result as string);
                    });
                    fileReader.readAsText(file);
                    close();
                  });
                  fileInput.click();
                }}
              >
                {translate('options_importBlacklistDialog_selectFile')}
              </Button>
            ) : (
              <Button
                {...(state.pb ? { class: FOCUS_END_CLASS } : {})}
                disabled={!state.pb}
                primary
                onClick={() => {
                  let newBlacklist = '';
                  for (const domain of lines(state.pb)) {
                    if (/^([A-Za-z0-9-]+\.)*[A-Za-z0-9-]+$/.test(domain)) {
                      newBlacklist = `${newBlacklist}${newBlacklist ? '\n' : ''}*://*.${domain}/*`;
                    }
                  }
                  replaceOrAppend(newBlacklist);
                  close();
                }}
              >
                {translate('options_importBlacklistDialog_importButton')}
              </Button>
            )}
          </RowItem>
        </Row>
      </DialogFooter>
    </Dialog>
  );
};

const SetBlacklist: FunctionComponent = () => {
  const {
    initialItems: { blacklist: initialBlacklist },
  } = useOptionsContext();
  const [blacklist, setBlacklist] = useState(initialBlacklist);
  const [blacklistDirty, setBlacklistDirty] = useState(false);
  const [latestBlacklist, setLatestBlacklist] = useState<string | null>(null);
  const [importBlacklistDialogOpen, setImportBlacklistDialogOpen] = useState(false);
  useEffect(
    () =>
      addMessageListeners({
        'blocklist-saved': (latestBlacklist, source) => {
          if (source !== 'options') {
            setLatestBlacklist(latestBlacklist);
          }
        },
      }),
    [],
  );
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper fullWidth>
            <ControlLabel for="blacklist">{translate('options_blacklistLabel')}</ControlLabel>
            <SubLabel>{expandLinks(translate('options_blacklistHelper'))}</SubLabel>
            <SubLabel>{translate('options_blockByTitle')}</SubLabel>
            <SubLabel>{translate('options_blacklistExample', '*://*.example.com/*')}</SubLabel>
            <SubLabel>{translate('options_blacklistExample', '/example\\.(net|org)/')}</SubLabel>
            <SubLabel>{translate('options_blacklistExample', 'title/Example Domain/')}</SubLabel>
          </LabelWrapper>
          <TextArea
            id="blacklist"
            rows={10}
            spellcheck={false}
            value={blacklist}
            wrap="off"
            onInput={e => {
              setBlacklist(e.currentTarget.value);
              setBlacklistDirty(true);
            }}
          />
        </RowItem>
      </Row>
      <Row multiline right>
        {latestBlacklist != null && (
          <RowItem expanded>
            <Text>
              {translate('options_blacklistUpdated')}{' '}
              <LinkButton
                onClick={() => {
                  setBlacklist(latestBlacklist);
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
              >
                {translate('options_reloadBlacklistButton')}
              </LinkButton>
            </Text>
          </RowItem>
        )}
        <RowItem>
          <Row>
            <RowItem>
              <Button
                onClick={() => {
                  setImportBlacklistDialogOpen(true);
                }}
              >
                {translate('options_importBlacklistButton')}
              </Button>
            </RowItem>
            <RowItem>
              <Button
                onClick={() => {
                  const a = document.createElement('a');
                  a.href = `data:text/plain;charset=UTF-8,${encodeURIComponent(blacklist)}`;
                  a.download = 'uBlacklist.txt';
                  a.click();
                }}
              >
                {translate('options_exportBlacklistButton')}
              </Button>
            </RowItem>
            <RowItem>
              <Button
                disabled={!blacklistDirty}
                primary
                onClick={() => {
                  void saveToLocalStorage({ blacklist }, 'options');
                  setBlacklistDirty(false);
                  setLatestBlacklist(null);
                }}
              >
                {translate('options_saveBlacklistButton')}
              </Button>
            </RowItem>
          </Row>
        </RowItem>
      </Row>
      <Portal id="importBlacklistDialogPortal">
        <ImportBlacklistDialog
          close={() => setImportBlacklistDialogOpen(false)}
          open={importBlacklistDialogOpen}
          setBlacklist={setBlacklist}
          setBlacklistDirty={setBlacklistDirty}
        />
      </Portal>
    </SectionItem>
  );
};

const RegisterSearchEngine: FunctionComponent<{
  id: SearchEngineId;
  matches: string[];
  messageNames: { name: MessageName0 };
}> = ({ id, matches, messageNames }) => {
  const [registered, setRegistered] = useState(false);
  useEffect(() => {
    void (async () => {
      const registered = await apis.permissions.contains({ origins: matches });
      setRegistered(registered);
    })();
  }, [matches]);
  return (
    <Row>
      <RowItem expanded>{translate(messageNames.name)}</RowItem>
      <RowItem>
        {registered ? (
          <Button disabled>{translate('options_searchEngineRegistered')}</Button>
        ) : (
          <Button
            onClick={async () => {
              const registered = await apis.permissions.request({
                origins: matches,
              });
              if (registered) {
                void sendMessage('register-search-engine', id);
              }
              setRegistered(registered);
            }}
          >
            {translate('options_registerSearchEngine')}
          </Button>
        )}
      </RowItem>
    </Row>
  );
};

const RegisterSearchEngines: FunctionComponent = () => {
  /* #if CHROME_MV3 || SAFARI
  return null;
  */
  // #else
  return (
    <SectionItem>
      <Row>
        <RowItem expanded>
          <LabelWrapper>
            <Label>{translate('options_otherSearchEngines')}</Label>
            <SubLabel>{translate('options_otherSearchEnginesDescription')}</SubLabel>
          </LabelWrapper>
        </RowItem>
      </Row>
      <Row>
        <RowItem>
          <Indent />
        </RowItem>
        <RowItem expanded>
          <List>
            {stringEntries(searchEngineMatches).map(
              ([id, matches]) =>
                id !== 'google' && (
                  <ListItem key={id}>
                    <RegisterSearchEngine
                      id={id}
                      matches={matches}
                      messageNames={searchEngineMessageNames[id]}
                    />
                  </ListItem>
                ),
            )}
          </List>
        </RowItem>
      </Row>
    </SectionItem>
  );
  // #endif
};

export const GeneralSection: FunctionComponent = () => (
  <Section aria-labelledby="generalSectionTitle" id="general">
    <SectionHeader>
      <SectionTitle id="generalSectionTitle">{translate('options_generalTitle')}</SectionTitle>
    </SectionHeader>
    <SectionBody>
      <SetBlacklist />
      <RegisterSearchEngines />
      <SectionItem>
        <SetBooleanItem
          itemKey="skipBlockDialog"
          label={translate('options_skipBlockDialogLabel')}
        />
      </SectionItem>
      <SectionItem>
        <SetBooleanItem itemKey="hideBlockLinks" label={translate('options_hideBlockLinksLabel')} />
      </SectionItem>
      <SectionItem>
        <SetBooleanItem itemKey="hideControl" label={translate('options_hideControlLabel')} />
      </SectionItem>
    </SectionBody>
  </Section>
);
