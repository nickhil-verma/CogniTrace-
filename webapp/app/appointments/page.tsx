'use client';

import React, { useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, MapPin, User, Clock, Trash2, Edit3, CheckCircle, XCircle } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';
import { Appointment } from '@/types/appointment';

export default function AppointmentsPage() {
  const { appointments, addAppointment, updateAppointment, cancelAppointment, deleteAppointment } = useAppointments();
  const { t } = useLanguage();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('10:30 AM');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const openCreateModal = () => {
    setEditingId(null);
    setTitle('');
    setDoctorName('');
    setSpecialty('Neurology');
    setDate('Tomorrow');
    setTime('10:30 AM');
    setLocation('City Care Hospital');
    setNotes('');
    setIsModalOpen(true);
  };

  const openEditModal = (apt: Appointment) => {
    setEditingId(apt.id);
    setTitle(apt.title);
    setDoctorName(apt.doctorName);
    setSpecialty(apt.specialty);
    setDate(apt.date);
    setTime(apt.time);
    setLocation(apt.location);
    setNotes(apt.notes || '');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !doctorName) return;

    if (editingId) {
      updateAppointment(editingId, {
        title,
        doctorName,
        specialty: specialty || 'Neurology',
        date,
        time,
        location: location || 'City Care Hospital',
        notes,
      });
    } else {
      addAppointment({
        title,
        doctorName,
        specialty: specialty || 'Neurology',
        date,
        time,
        location: location || 'City Care Hospital',
        notes,
        status: 'Upcoming'
      });
    }

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="accent">{t('appointments.badge')}</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            {t('appointments.title')}
          </h1>
          <p className="text-sm text-[#66736F]">
            Schedule, manage, and track medical consultations.
          </p>
        </div>
        <Button variant="default" onClick={openCreateModal} className="shadow-md">
          <Plus className="w-4 h-4 mr-2 text-white" />
          {t('appointments.scheduleButton')}
        </Button>
      </div>

      {/* Empty State */}
      {appointments.length === 0 && (
        <Card className="p-12 text-center bg-white border border-[#DDE7E3] rounded-3xl space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-[#E8F4F1] text-[#164E48] flex items-center justify-center mx-auto border border-[#BFDCD6]">
            <Calendar className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-sm mx-auto">
            <h3 className="text-lg font-bold text-[#123B35]">No Appointments Scheduled</h3>
            <p className="text-xs text-[#66736F] leading-relaxed">
              Add upcoming doctor visits, specialist checkups, or therapy sessions to keep your care schedule updated.
            </p>
          </div>
          <Button variant="default" onClick={openCreateModal} className="shadow-md px-6 py-2">
            <Plus className="w-4 h-4 mr-2" />
            Schedule First Appointment
          </Button>
        </Card>
      )}

      {/* Appointments Grid */}
      {appointments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {appointments.map((apt) => (
            <Card
              key={apt.id}
              className={`border transition-all duration-200 hover:shadow-md ${
                apt.status === 'Cancelled' ? 'opacity-60 bg-[#F5F8F6]' : 'bg-white'
              }`}
            >
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="space-y-1">
                  <Badge variant={apt.status === 'Upcoming' ? 'teal' : (apt.status === 'Completed' ? 'default' : 'outline')}>
                    {apt.status === 'Upcoming' ? t('common.upcoming') : (apt.status === 'Cancelled' ? t('common.cancelled') : apt.status)}
                  </Badge>
                  <CardTitle className="text-xl font-bold text-[#123B35]">
                    {apt.title}
                  </CardTitle>
                </div>
                <div className="flex items-center space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditModal(apt)}
                    className="text-[#17665B] hover:bg-[#E8F4F1]"
                    title="Edit Appointment"
                  >
                    <Edit3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAppointment(apt.id)}
                    className="text-red-400 hover:text-red-600 hover:bg-red-50"
                    title={t('appointments.deleteAppointment')}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-3 text-xs text-[#66736F]">
                <div className="flex items-center space-x-2 font-bold text-sm text-[#123B35]">
                  <User className="w-4 h-4 text-[#17665B]" />
                  <span>{apt.doctorName} ({apt.specialty})</span>
                </div>

                <div className="flex items-center space-x-2">
                  <Clock className="w-4 h-4 text-[#3E9C87]" />
                  <span>{apt.date} at {apt.time}</span>
                </div>

                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-[#C85C82]" />
                  <span>{apt.location}</span>
                </div>

                {apt.notes && (
                  <p className="p-3 rounded-xl bg-[#F5F8F6] border border-[#DDE7E3] text-[#123B35] leading-relaxed">
                    {t('appointments.noteLabel', { notes: apt.notes })}
                  </p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-[#DDE7E3]">
                  {apt.status === 'Upcoming' ? (
                    <div className="flex items-center space-x-2 w-full justify-between">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateAppointment(apt.id, { status: 'Completed' })}
                        className="text-xs text-[#164E48] hover:bg-[#E8F4F1] border-[#164E48]/20"
                      >
                        <CheckCircle className="w-3.5 h-3.5 mr-1" />
                        Mark Completed
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => cancelAppointment(apt.id)}
                        className="text-xs text-red-500 hover:bg-red-50"
                      >
                        <XCircle className="w-3.5 h-3.5 mr-1" />
                        {t('appointments.cancelAppointment')}
                      </Button>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => updateAppointment(apt.id, { status: 'Upcoming' })}
                      className="text-xs text-[#17665B] hover:bg-[#E8F4F1]"
                    >
                      Re-open Appointment
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Schedule / Edit Modal */}
      <Dialog
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? 'Edit Medical Appointment' : t('appointments.modalTitle')}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('appointments.formTitle')}</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={t('appointments.formTitlePlaceholder')}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('appointments.formDoctor')}</label>
              <Input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder={t('appointments.formDoctorPlaceholder')}
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('appointments.formSpecialty')}</label>
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder={t('appointments.formSpecialtyPlaceholder')}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('appointments.formDate')}</label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder={t('appointments.formDatePlaceholder')}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">{t('appointments.formTime')}</label>
              <Input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder={t('appointments.formTimePlaceholder')}
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('appointments.formLocation')}</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder={t('appointments.formLocationPlaceholder')}
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">{t('appointments.formNotes')}</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder={t('appointments.formNotesPlaceholder')}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#DDE7E3]">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              {t('common.cancel')}
            </Button>
            <Button variant="default" type="submit">
              {editingId ? 'Save Changes' : t('appointments.saveAppointment')}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
