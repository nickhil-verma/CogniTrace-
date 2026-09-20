'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { User, Phone, PhoneCall, MapPin, Building2, Save, CheckCircle2, ShieldCheck, Heart } from 'lucide-react';
import { usePatientSettings } from '@/hooks/usePatientSettings';
import { useUserRole } from '@/hooks/useUserRole';
import Link from 'next/link';

export default function SettingsPage() {
  const { settings, updateSettings } = usePatientSettings();
  const { isPatient } = useUserRole();

  const [form, setForm] = useState({
    patientName: '',
    patientPhone: '',
    emergencyContact: '',
    localAddress: '',
    hospitalName: '',
    hospitalContact: '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setForm({
      patientName: settings.patientName || '',
      patientPhone: settings.patientPhone || '',
      emergencyContact: settings.emergencyContact || '',
      localAddress: settings.localAddress || '',
      hospitalName: settings.hospitalName || '',
      hospitalContact: settings.hospitalContact || '',
    });
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  return (
    <div className="max-w-4xl space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="border-b border-[#DDE7E3] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Badge variant="teal">Caregiver Settings Portal</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Patient Profile & Emergency Contacts
          </h1>
          <p className="text-sm text-[#66736F]">
            Manage patient identity, synced emergency dials, local residence address, and hospital contact records.
          </p>
        </div>

        {isPatient && (
          <Link href="/dashboard">
            <Button variant="default" className="bg-[#164E48] text-white hover:bg-[#113e39] font-bold text-xs shadow-md">
              <Heart className="w-4 h-4 mr-1.5 fill-current text-white" />
              Return Home
            </Button>
          </Link>
        )}
      </div>

      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-[#BFDCD6]/30 border border-[#17665B]/30 text-[#17665B] text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-[#17665B] shrink-0" />
            <span>Settings successfully saved and synced across patient portal & emergency controls!</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Patient Identity & Phone */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5 text-[#17665B]" />
              <CardTitle className="text-lg font-bold text-[#123B35]">Patient Personal Identity</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#66736F]">
              Primary details for the patient under care
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B35]">Patient Full Name</label>
              <Input
                value={form.patientName}
                onChange={(e) => setForm({ ...form, patientName: e.target.value })}
                placeholder="e.g. Mom (Sunita Sharma)"
                required
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B35]">Patient Phone Number</label>
              <Input
                type="tel"
                value={form.patientPhone}
                onChange={(e) => setForm({ ...form, patientPhone: e.target.value })}
                placeholder="e.g. +1 (555) 234-5678"
                className="text-xs font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Synced Emergency Contact */}
        <Card className="border-l-4 border-l-red-500">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <PhoneCall className="w-5 h-5 text-red-500" />
                <CardTitle className="text-lg font-bold text-[#123B35]">Synced Patient Emergency Contact</CardTitle>
              </div>
              <Badge className="bg-red-100 text-red-700 border-red-200 font-bold text-[10px]">
                Synced with Patient Dial
              </Badge>
            </div>
            <CardDescription className="text-xs text-[#66736F]">
              This contact number will be automatically dialed when the patient taps the Emergency button in their portal.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B35]">Patient Emergency Contact Number</label>
              <Input
                type="tel"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                placeholder="e.g. +1 (555) 911-0099"
                required
                className="text-xs font-mono font-bold text-red-600"
              />
            </div>
            <p className="text-[11px] text-[#66736F]">
              Note: If left blank, the emergency button defaults to local emergency services (911 / 102).
            </p>
          </CardContent>
        </Card>

        {/* Local Residence Address */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-[#17665B]" />
              <CardTitle className="text-lg font-bold text-[#123B35]">Patient Local Address</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#66736F]">
              Current local residence address for home care visits and first responders
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B35]">Full Residential Address</label>
              <textarea
                value={form.localAddress}
                onChange={(e) => setForm({ ...form, localAddress: e.target.value })}
                placeholder="e.g. 452 Oak Ridge Lane, Sector 4, New Delhi"
                rows={3}
                className="w-full p-3 text-xs rounded-xl border border-[#DDE7E3] bg-white focus:outline-none focus:ring-2 focus:ring-[#17665B]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Hospital & Medical Contact Info */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Building2 className="w-5 h-5 text-[#17665B]" />
              <CardTitle className="text-lg font-bold text-[#123B35]">Hospital & Medical Center</CardTitle>
            </div>
            <CardDescription className="text-xs text-[#66736F]">
              Primary hospital and physician contact line
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B35]">Name of Hospital / Clinic</label>
              <Input
                value={form.hospitalName}
                onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                placeholder="e.g. City Care General Hospital"
                className="text-xs font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#123B35]">Hospital Contact / Emergency Phone</label>
              <Input
                type="tel"
                value={form.hospitalContact}
                onChange={(e) => setForm({ ...form, hospitalContact: e.target.value })}
                placeholder="e.g. +1 (555) 800-4357"
                className="text-xs font-medium"
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit Save Button */}
        <div className="flex items-center justify-end space-x-4 pt-2">
          <Button
            type="submit"
            variant="default"
            size="lg"
            className="bg-[#17665B] text-white hover:bg-[#124d45] font-bold text-xs px-8 shadow-md rounded-2xl"
          >
            <Save className="w-4 h-4 mr-2" />
            Save & Sync Patient Settings
          </Button>
        </div>
      </form>
    </div>
  );
}
