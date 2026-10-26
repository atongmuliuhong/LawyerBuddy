import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import type { SettingsProject } from "../../shared/types";
import { useLawyerBuddyConfig } from "../../../../hooks/useLawyerBuddyConfig";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { LawyerBuddyConfig } from "../modelPool/types";
import { ConfigSaveError } from "../../shared/view";
import AlwaysOnSection from "./components/AlwaysOnSection";

type AgentResidentSectionsProps = {
  title: string;
  projects: SettingsProject[];
};

export default function AgentResidentSections({
  title: _title,
  projects,
}: AgentResidentSectionsProps) {
  const { t } = useTranslation("settings");
  const { raw, commitRaw, loading, error } = useLawyerBuddyConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const onFormChange = (next: LawyerBuddyConfig) => {
    try {
      void commitRaw(configToYamlString(next));
    } catch (caught) {
      console.error("Failed to serialise agent resident config patch", caught);
    }
  };

  if (loading) {
    return (
      <div className="resident-page-content">
        <div className="py-6 text-xs text-muted-foreground">
          {t("lawyerBuddyConfig.loading")}
        </div>
      </div>
    );
  }

  if (!parsedConfig) {
    return (
      <div className="resident-page-content">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {t("settingsPage.invalidYaml.agentResident")}
        </div>
      </div>
    );
  }

  return (
    <div className="resident-page-content">
      <ConfigSaveError error={error} />
      <AlwaysOnSection
        config={parsedConfig}
        projects={projects}
        onChange={onFormChange}
      />
    </div>
  );
}
