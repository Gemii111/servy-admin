/**
 * App version / force-update config — Handoff §14
 */

import apiClient from './client';
import { handleApiError } from './client';
import { shouldUseMock } from './base';
import { getSettings, updateSettings } from './settings';

export interface AppVersionConfig {
  min_version: string;
  min_version_android: string;
  min_version_ios: string;
  force_update: boolean;
  store_url_android?: string;
  store_url_ios?: string;
}

const mockVersionConfig: AppVersionConfig = {
  min_version: '1.0.3',
  min_version_android: '1.0.3',
  min_version_ios: '1.0.3',
  force_update: false,
  store_url_android: 'https://play.google.com/store/apps/details?id=com.souq.customer',
  store_url_ios: 'https://apps.apple.com/app/souq',
};

async function realGetVersionConfig(): Promise<AppVersionConfig> {
  try {
    const res = await apiClient.get('/app/version-config');
    const body = res.data as { data?: AppVersionConfig } & AppVersionConfig;
    return body.data ?? body;
  } catch {
    const settings = await getSettings();
    return {
      min_version: '1.0.0',
      min_version_android: '1.0.0',
      min_version_ios: '1.0.0',
      force_update: settings.general.maintenanceMode,
    };
  }
}

async function realUpdateVersionConfig(config: Partial<AppVersionConfig>): Promise<AppVersionConfig> {
  await updateSettings('general', {
    maintenanceMode: config.force_update ?? false,
  } as never);
  const settingsMap: Record<string, string> = {};
  if (config.min_version_android != null) {
    settingsMap.min_version_android = config.min_version_android;
  }
  if (config.min_version_ios != null) {
    settingsMap.min_version_ios = config.min_version_ios;
  }
  if (config.force_update != null) {
    settingsMap.force_update = String(config.force_update);
  }
  if (Object.keys(settingsMap).length > 0) {
    await apiClient.put('/admin/settings', { settings: settingsMap });
  }
  return realGetVersionConfig();
}

export async function getVersionConfig(): Promise<AppVersionConfig> {
  try {
    return shouldUseMock() ? { ...mockVersionConfig } : realGetVersionConfig();
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}

export async function updateVersionConfig(
  config: Partial<AppVersionConfig>
): Promise<AppVersionConfig> {
  try {
    if (shouldUseMock()) {
      Object.assign(mockVersionConfig, config);
      return { ...mockVersionConfig };
    }
    return realUpdateVersionConfig(config);
  } catch (err) {
    throw new Error(handleApiError(err));
  }
}
