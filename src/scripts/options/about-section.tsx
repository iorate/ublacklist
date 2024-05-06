import { useMemo } from "react";
import icon from "../../icons/icon.svg";
import { browser } from "../browser.ts";
import { Icon } from "../components/icon.tsx";
import { Indent } from "../components/indent.tsx";
import { Label, LabelWrapper, SubLabel } from "../components/label.tsx";
import { Link } from "../components/link.tsx";
import { Row, RowItem } from "../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../components/section.tsx";
import { useClassName } from "../components/utilities.ts";
import { getWebsiteURL, translate } from "../locales.ts";
import { svgToDataURL } from "../utilities.ts";

export const AboutSection: React.FC = () => {
  const version = useMemo(() => browser.runtime.getManifest().version, []);
  const thirdPartyNoticesURL = useMemo(
    () => browser.runtime.getURL("third-party-notices.txt"),
    [],
  );
  const nameClassName = useClassName(
    () => ({
      fontSize: "1.5em",
    }),
    [],
  );
  return (
    <Section aria-labelledby="aboutSectionTitle" id="about">
      <SectionHeader>
        <SectionTitle id="aboutSectionTitle">
          {translate("options_aboutTitle")}
        </SectionTitle>
      </SectionHeader>
      <SectionBody>
        <SectionItem>
          <Row>
            <RowItem>
              <Indent depth={1.5}>
                <Icon iconSize="36px" url={svgToDataURL(icon)} />
              </Indent>
            </RowItem>
            <RowItem expanded>
              <LabelWrapper>
                <Label className={nameClassName}>
                  {translate("extensionName")}
                </Label>
                <SubLabel>{`${translate(
                  "options_aboutVersion",
                )}: ${version}`}</SubLabel>
                <SubLabel>
                  <Link href={getWebsiteURL("/docs")}>
                    {translate("options_aboutDocumentation")}
                  </Link>
                  {" / "}
                  <Link href="https://github.com/iorate/ublacklist/releases">
                    {translate("options_aboutReleaseNotes")}
                  </Link>
                  {" / "}
                  <Link href={getWebsiteURL("/privacy-policy")}>
                    {translate("options_aboutPrivacyPolicy")}
                  </Link>
                  {" / "}
                  <Link href={thirdPartyNoticesURL}>
                    {translate("options_aboutThirdPartyNotices")}
                  </Link>
                </SubLabel>
              </LabelWrapper>
            </RowItem>
          </Row>
        </SectionItem>
      </SectionBody>
    </Section>
  );
};
