import {
  mkdtempSync,
  mkdirSync,
  renameSync,
  rmSync,
  symlinkSync,
  writeFileSync,
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

let watcherModule;
let tempDir;

afterEach(() => {
  watcherModule?.stopLawyerBuddyConfigWatcher();
  watcherModule = null;
  delete process.env.LAWYERBUDDY_CONFIG_PATH;
  if (tempDir) rmSync(tempDir, { recursive: true, force: true });
  tempDir = null;
  vi.restoreAllMocks();
  vi.resetModules();
});

describe('lawyerbuddy config watcher', () => {
  it('reloads when a symlink target is atomically replaced', async () => {
    tempDir = mkdtempSync(join(tmpdir(), 'lawyerbuddy-config-watcher-'));
    const linkDir = join(tempDir, 'link');
    const targetDir = join(tempDir, 'managed');
    mkdirSync(linkDir);
    mkdirSync(targetDir);
    const configPath = join(linkDir, 'lawyerbuddy.yaml');
    const targetPath = join(targetDir, 'lawyerbuddy.yaml');
    writeFileSync(targetPath, 'schemaVersion: 1\ncustomEnv:\n  VALUE: before\n', 'utf8');
    symlinkSync(targetPath, configPath);
    process.env.LAWYERBUDDY_CONFIG_PATH = configPath;

    const reloadLawyerBuddyConfig = vi.fn(async () => ({ reloaded: true }));
    vi.doMock('./lawyerbuddyConfigReloader.js', () => ({ reloadLawyerBuddyConfig }));
    watcherModule = await import('./lawyerbuddyConfigWatcher.js');

    const event = new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Timed out waiting for config event')), 3000);
      void watcherModule.startLawyerBuddyConfigWatcher({
        onEvent: (payload) => {
          clearTimeout(timeout);
          resolve(payload);
        },
      }).then(() => {
        const replacement = join(targetDir, '.lawyerbuddy.yaml.external.tmp');
        writeFileSync(replacement, 'schemaVersion: 1\ncustomEnv:\n  VALUE: after\n', 'utf8');
        renameSync(replacement, targetPath);
      }).catch(reject);
    });

    await expect(event).resolves.toMatchObject({
      source: 'watcher',
      config: { customEnv: { VALUE: 'after' } },
    });
    expect(reloadLawyerBuddyConfig).toHaveBeenCalledOnce();
  });
});
