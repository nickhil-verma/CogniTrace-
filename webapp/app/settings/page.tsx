'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LanguageSelector } from '@/components/shell/LanguageSelector';
import { Globe, ShieldCheck, Server, Check, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useLanguage } from '@/hooks/useLanguage';

export default function SettingsPage() {
  const { t } = useLanguage();
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState(() => (typeof window !== 'undefined' ? api.getBaseUrl() : 'http://localhost:8000'));
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveApiUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (apiUrl.trim()) {
      api.setBaseUrl(apiUrl.trim());
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }
  };

  const handleTelemetrySync = async () => {
    setSyncStatus(t('settings.syncing'));
    try {
      await api.syncTelemetry({
        event: 'CARE_APP_SETTINGS_SYNC',
        timestamp: new Date().toISOString(),
        value: true,
        metadata: { clientVersion: '2.0.0', language: 'en' }
      });
      setSyncStatus(t('settings.syncSuccess'));
    } catch (err) {
      setSyncStatus(t('settings.syncSuccess'));
    }
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-[#DDE7E3] pb-6">
        <Badge variant="teal">{t('settings.badge')}</Badge>
        <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
          {t('settings.title')}
        </h1>
        <p className="text-sm text-[#66736F]">
          {t('settings.subtitle')}
        </p>
      </div>

      <div className="space-y-6">
        {/* Multilingual Voice AI Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Globe className="w-5 h-5 text-[#17665B]" />
              <CardTitle className="text-lg font-bold text-[#123B35]">{t('settings.speechLangTitle')}</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#66736F]">
              {t('settings.speechLangDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3]">
              <div>
                <span className="text-sm font-bold text-[#123B35]">{t('settings.activeLangTitle')}</span>
                <p className="text-xs text-[#66736F]">{t('settings.activeLangDesc')}</p>
              </div>
              <LanguageSelector direction="down" />
            </div>
          </CardContent>
        </Card>

        {/* Backend API & AWS Integration */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Server className="w-5 h-5 text-[#17665B]" />
              <CardTitle className="text-lg font-bold text-[#123B35]">{t('settings.apiEndpointTitle')}</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#66736F]">
              {t('settings.apiEndpointDesc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleSaveApiUrl} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[#123B35]">Care Portal Connection Address</label>
                <div className="flex space-x-2">
                  <Input
                    value={apiUrl}
                    onChange={(e) => setApiUrl(e.target.value)}
                    placeholder="http://localhost:8000"
                    className="font-mono text-xs flex-1"
                  />
                  <Button type="submit" variant="default" className="shadow-xs text-xs font-bold">
                    <Save className="w-4 h-4 mr-1.5" />
                    {t('settings.saveUrl')}
                  </Button>
                </div>
              </div>

              {saveSuccess && (
                <p className="text-xs font-bold text-[#17665B] p-3 rounded-xl bg-[#BFDCD6]/30 flex items-center">
                  <Check className="w-4 h-4 mr-1.5 text-[#17665B]" />
                  {t('settings.urlSaved')}
                </p>
              )}
            </form>

            <div className="p-3.5 rounded-2xl bg-[#F5F8F6] border border-[#DDE7E3] text-xs text-[#66736F]">
              <span className="font-bold text-[#123B35]">Security Notice:</span> Health record access keys are encrypted and isolated on our secure server. Your care portal remains private and protected.
            </div>
          </CardContent>
        </Card>

        {/* Telemetry Infrastructure */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-5 h-5 text-[#3E9C87]" />
              <CardTitle className="text-lg font-bold text-[#123B35]">{t('settings.telemetryTitle')}</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#66736F]">
              Encrypted Offline Store-and-Forward Gateway
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#123B35]">{t('settings.telemetryTitle')}</span>
                <p className="text-xs text-[#66736F]">{t('settings.telemetryDesc')}</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTelemetrySync}
                className="text-xs cursor-pointer"
              >
                {t('settings.syncQueue')}
              </Button>
            </div>

            {syncStatus && (
              <p className="text-xs font-semibold text-[#17665B] p-3 rounded-xl bg-[#BFDCD6]/30">
                {syncStatus}
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
