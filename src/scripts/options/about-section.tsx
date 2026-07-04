import clsx from "clsx";
import { useId, useMemo } from "react";
import icon from "../../icons/icon.svg";
import labelStyles from "../components/label.module.css";
import { Link } from "../components/link.tsx";
import rowStyles from "../components/row.module.css";
import sectionStyles from "../components/section.module.css";
import svgIconStyles from "../components/svg-icon.module.css";
import { SvgIcon } from "../components/svg-icon.tsx";
import { browser } from "../shared/browser.ts";
import { getWebsiteURL, translate } from "../shared/locales.ts";
import styles from "./about-section.module.css";

export function AboutSection(props: { id: string }) {
  const id = useId();
  const version = useMemo(() => browser.runtime.getManifest().version, []);
  const thirdPartyNoticesURL = useMemo(
    () => browser.runtime.getURL("third-party-notices.txt"),
    [],
  );
  return (
    <section
      className={sectionStyles.section}
      aria-labelledby={`${id}-title`}
      id={props.id}
    >
      <div className={sectionStyles.header}>
        <h1 className={sectionStyles.title} id={`${id}-title`}>
          {translate("options_aboutTitle")}
        </h1>
      </div>
      <div className={sectionStyles.body}>
        <div className={sectionStyles.item}>
          <div className={rowStyles.row}>
            <div className={rowStyles.rowItem}>
              <div className={styles.iconIndent}>
                <SvgIcon className={svgIconStyles.large} svg={icon} />
              </div>
            </div>
            <div className={clsx(rowStyles.rowItem, rowStyles.expanded)}>
              <div className={labelStyles.wrapper}>
                <div className={clsx(labelStyles.label, styles.name)}>
                  {translate("extensionName")}
                </div>
                <div className={labelStyles.subLabel}>{`${translate(
                  "options_aboutVersion",
                )}: ${version}`}</div>
                <div className={labelStyles.subLabel}>
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
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
