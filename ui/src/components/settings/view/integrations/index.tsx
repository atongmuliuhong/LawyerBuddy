import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLawyerBuddyConfig } from "../../../../hooks/useLawyerBuddyConfig";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { LawyerBuddyConfig } from "../modelPool/types";
import { ConfigSaveError } from "../../shared/view";
import GatewayConfigSection from "./components/GatewayConfigSection";
import ImChannelsSection from "./im";

type IntegrationsSectionsProps = {
  title: string;
};

export default function IntegrationsSections({
  title: _title,
}: IntegrationsSectionsProps) {
  const { t } = useTranslation("settings");
  const { raw, commitRaw, loading, error } = useLawyerBuddyConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const onFormChange = (next: LawyerBuddyConfig) => {
    try {
      void commitRaw(configToYamlString(next));
    } catch (caught) {
      console.error("Failed to serialise integrations config patch", caught);
    }
  };

  return (
    <div className="integration-page-content">
      <ConfigSaveError error={error} />
      {loading ? (
        <div className="py-6 text-xs text-muted-foreground">
          {t("lawyerBuddyConfig.loading")}
        </div>
      ) : parsedConfig ? (
        <GatewayConfigSection config={parsedConfig} onChange={onFormChange} />
      ) : (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {t("settingsPage.invalidYaml.integrations")}
        </div>
      )}
      <ImChannelsSection />
    </div>
  );
}
