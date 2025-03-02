import { browser } from "../browser.ts";
import { Button } from "../components/button.tsx";
import { Label, LabelWrapper } from "../components/label.tsx";
import { Row, RowItem } from "../components/row.tsx";
import {
  Section,
  SectionBody,
  SectionHeader,
  SectionItem,
  SectionTitle,
} from "../components/section.tsx";
import { translate } from "../locales.ts";

export function ExperimentalSection(): React.ReactNode {
  return (
    process.env.BROWSER !== "safari" && (
      <Section aria-labelledby="experimentalSectionTitle" id="experimental">
        <SectionHeader>
          <SectionTitle id="experimentalSectionTitle">
            {translate("options_experimentalSectionTitle")}
          </SectionTitle>
        </SectionHeader>
        <SectionBody>
          <SectionItem>
            <Row>
              <RowItem expanded>
                <LabelWrapper>
                  <Label>{translate("options_serpInfoLabel")}</Label>
                </LabelWrapper>
              </RowItem>
              <RowItem>
                <Button
                  primary
                  onClick={() => {
                    browser.tabs.create({
                      url: "/pages/serpinfo/options.html",
                    });
                  }}
                >
                  {translate("options_openSerpInfoOptionsButton")}
                </Button>
              </RowItem>
            </Row>
          </SectionItem>
        </SectionBody>
      </Section>
    )
  );
}
