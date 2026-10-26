import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLawyerBuddyConfig } from "../../../../hooks/useLawyerBuddyConfig";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { LawyerBuddyConfig } from "../modelPool/types";
import { ConfigSaveError } from "../../shared/view";
import ToolsSection from "./components/ToolsSection";

type AgentSearchSectionsProps = {
  title: string;
};

export default function AgentSearchSections({
  title: _title,
}: AgentSearchSectionsProps) {
  const { t } = useTranslation("settings");
  const { raw, commitRaw, loading, error } = useLawyerBuddyConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const onFormChange = (next: LawyerBuddyConfig) => {
    try {
      void commitRaw(configToYamlString(next));
    } catch (caught) {
      console.error("Failed to serialise agent search config patch", caught);
    }
  };

  if (loading) {
    return (
      <div className="search-page-content">
        <div className="py-6 text-xs text-muted-foreground">
          {t("lawyerBuddyConfig.loading")}
        </div>
      </div>
    );
  }

  if (!parsedConfig) {
    return (
      <div className="search-page-content">
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {t("settingsPage.invalidYaml.agentSearch")}
        </div>
      </div>
    );
  }

  return (
    <div className="search-page-content">
      <ConfigSaveError error={error} />
      <ToolsSection config={parsedConfig} onChange={onFormChange} />
    </div>
  );
}
