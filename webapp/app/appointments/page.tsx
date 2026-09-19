'use client';

import React, { useState } from 'react';
import { useAppointments } from '@/hooks/useAppointments';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Calendar, Plus, MapPin, User, Clock, Trash2 } from 'lucide-react';

export default function AppointmentsPage() {
  const { appointments, addAppointment, cancelAppointment, deleteAppointment } = useAppointments();
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [doctorName, setDoctorName] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [date, setDate] = useState('Tomorrow');
  const [time, setTime] = useState('10:30 AM');
  const [location, setLocation] = useState('');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !doctorName) return;
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
    setIsAddOpen(false);
    setTitle('');
    setDoctorName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#DDE7E3] pb-6">
        <div>
          <Badge variant="accent">Medical Care Team</Badge>
          <h1 className="text-3xl font-extrabold text-[#123B35] tracking-tight mt-1">
            Doctor Appointments
          </h1>
          <p className="text-sm text-[#66736F]">
            Schedule and track upcoming medical consultations.
          </p>
        </div>
        <Button variant="default" onClick={() => setIsAddOpen(true)} className="shadow-md">
          <Plus className="w-4 h-4 mr-2 text-white" />
          Schedule Appointment
        </Button>
      </div>

      {/* Appointments List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((apt) => (
          <Card
            key={apt.id}
            className={`border transition-all duration-200 ${
              apt.status === 'Cancelled' ? 'opacity-60 bg-[#F5F8F6]' : 'bg-white'
            }`}
          >
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="space-y-1">
                <Badge variant={apt.status === 'Upcoming' ? 'teal' : 'outline'}>
                  {apt.status}
                </Badge>
                <CardTitle className="text-xl font-bold text-[#123B35]">
                  {apt.title}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteAppointment(apt.id)}
                  className="text-red-400 hover:text-red-600 hover:bg-red-50"
                  title="Delete Appointment"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="p-3 rounded-2xl bg-[#BFDCD6]/30 text-[#17665B]">
                  <Calendar className="w-6 h-6" />
                </div>
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
                  Note: {apt.notes}
                </p>
              )}

              {apt.status === 'Upcoming' && (
                <div className="flex justify-end space-x-2 pt-2 border-t border-[#DDE7E3]">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => cancelAppointment(apt.id)}
                    className="text-xs text-red-500 hover:bg-red-50"
                  >
                    Cancel Appointment
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Schedule Modal */}
      <Dialog
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        title="Schedule Doctor Appointment"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Appointment Title</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Neurology Cognitive Consultation"
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Doctor Name</label>
              <Input
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                placeholder="Dr. Anita Sharma"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Specialty</label>
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Cognitive Neurology"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Date</label>
              <Input
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="Tomorrow, Sept 19"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-[#123B35]">Time</label>
              <Input
                value={time}
                onChange={(e) => setTime(e.target.value)}
                placeholder="10:30 AM"
              />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Clinic / Hospital Location</label>
            <Input
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="City Care Hospital, Suite 402"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-[#123B35]">Caregiver Notes</label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Bring recent observation log & current prescriptions"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-[#DDE7E3]">
            <Button variant="outline" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="default" type="submit">
              Save Appointment
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
