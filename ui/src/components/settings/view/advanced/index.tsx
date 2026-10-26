import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useLawyerBuddyConfig } from "../../../../hooks/useLawyerBuddyConfig";
import { ConfigSaveError } from "../../shared/view";
import { configToYamlString, safeParseYaml } from "../modelPool/utils/configYaml";
import type { LawyerBuddyConfig } from "../modelPool/types";
import AdvancedRetrySection from "./components/AdvancedRetrySection";
import ServiceSection from "./components/ServiceSection";
import CustomEnvSection from "./components/CustomEnvSection";

type AdvancedSectionsProps = {
  title: string;
};

export default function AdvancedSections({ title: _title }: AdvancedSectionsProps) {
  const { t } = useTranslation("settings");
  const {
    path,
    raw,
    commitRaw,
    loading,
    saving,
    error,
  } = useLawyerBuddyConfig();
  const parsedConfig = useMemo(() => safeParseYaml(raw), [raw]);

  const saveConfig = async (next: LawyerBuddyConfig) => {
    try {
      const result = await commitRaw(configToYamlString(next));
      return result.ok;
    } catch (caught) {
      console.error("Failed to serialise advanced config patch", caught);
      return false;
    }
  };

  return (
    <div className="advanced-page-content">
      <ConfigSaveError error={error} />
      {loading ? (
        <div className="py-6 text-xs text-muted-foreground">
          {t("lawyerBuddyConfig.loading")}
        </div>
      ) : parsedConfig ? (
        <>
          <AdvancedRetrySection
            config={parsedConfig}
            onSave={saveConfig}
            saving={saving}
          />
          <ServiceSection
            config={parsedConfig}
            onSave={saveConfig}
            saving={saving}
          />
          <CustomEnvSection
            config={parsedConfig}
            onSave={saveConfig}
            saving={saving}
          />
        </>
      ) : (
        <div className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
          {t("settingsPage.invalidYaml.advanced")}
        </div>
      )}

      {!loading && path ? (
        <p className="advanced-config-file-note">
          {t("lawyerBuddyConfig.panels.advancedPage.configFilePrefix")}{" "}
          <code>{path}</code>
          {t("lawyerBuddyConfig.panels.advancedPage.configFileSuffix")}
        </p>
      ) : null}
    </div>
  );
}
