'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import Image from 'next/image';
import {
  Calendar,
  Clock,
  MapPin,
  Plus,
  Trash2,
  Edit3,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Tag,
  Save,
  Send,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export interface AdminEventItem {
  id: string;
  title: string;
  description: string;
  event_date: string;
  event_time?: string;
  location?: string;
  category: string;
  image_url?: string | null;
  organizer?: string;
  is_featured?: boolean;
  status?: string;
  created_at?: string;
}

const CATEGORIES = ['Reunion', 'Wedding', 'Meeting', 'Social', 'Sports', 'General'] as const;

export function AdminEventsManager() {
  const [events, setEvents] = useState<AdminEventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingEvent, setEditingEvent] = useState<Partial<AdminEventItem> | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [message, setMessage] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchEvents = useCallback(async () => {
    try {
      const res = await fetch('/api/events?admin=true', { cache: 'no-store' });
      const data = await res.json();
      if (data.ok && Array.isArray(data.events)) {
        setEvents(data.events);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleStartNew = () => {
    const today = new Date().toISOString().slice(0, 10);
    setEditingEvent({
      title: '',
      description: '',
      event_date: today,
      event_time: '10:00 AM',
      location: '',
      category: 'Reunion',
      image_url: '',
      organizer: 'NMS 08 Executive Council',
      status: 'published',
      is_featured: false,
    });
    setIsNew(true);
    setMessage(null);
  };

  const handleStartEdit = (event: AdminEventItem) => {
    setEditingEvent({ ...event });
    setIsNew(false);
    setMessage(null);
  };

  const handleCancelEdit = () => {
    setEditingEvent(null);
    setIsNew(false);
    setMessage(null);
  };

  const handleImageFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setMessage(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/events/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.ok && data.image_url) {
        setEditingEvent((prev) => (prev ? { ...prev, image_url: data.image_url } : null));
        setMessage({ type: 'ok', text: 'Event picture uploaded successfully.' });
      } else {
        setMessage({ type: 'err', text: data.message || 'Failed to upload event picture.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Network error uploading event picture.' });
    } finally {
      setUploadingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (publish = true) => {
    if (!editingEvent?.title?.trim()) {
      setMessage({ type: 'err', text: 'Event title is required.' });
      return;
    }
    if (!editingEvent?.event_date) {
      setMessage({ type: 'err', text: 'Event date is required.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const payload = {
      ...editingEvent,
      status: publish ? 'published' : (editingEvent.status || 'draft'),
    };

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (data.ok) {
        setMessage({ type: 'ok', text: isNew ? 'Event created successfully!' : 'Event updated successfully.' });
        setEditingEvent(null);
        setIsNew(false);
        fetchEvents();
      } else {
        setMessage({ type: 'err', text: data.message || 'Failed to save event.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Network error saving event.' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;

    try {
      const res = await fetch(`/api/events?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.ok) {
        setMessage({ type: 'ok', text: 'Event deleted successfully.' });
        fetchEvents();
      } else {
        setMessage({ type: 'err', text: data.message || 'Failed to delete event.' });
      }
    } catch {
      setMessage({ type: 'err', text: 'Network error deleting event.' });
    }
  };

  const inputCls =
    'w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 text-xs transition-all';
  const labelCls = 'block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5';

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <h2 className="text-lg font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Events &amp; Reunions Management
          </h2>
          <p className="text-xs text-slate-500">
            Create, publish, and manage class events, reunions, dinners, and brother celebrations.
          </p>
        </div>

        {!editingEvent && (
          <Button
            variant="emerald"
            size="sm"
            icon={<Plus className="w-4 h-4" />}
            onClick={handleStartNew}
          >
            Create Event
          </Button>
        )}
      </div>

      {/* Status messages */}
      {message && (
        <div
          className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs font-medium animate-in fade-in ${
            message.type === 'ok'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
          )}
          <span>{message.text}</span>
          <button
            onClick={() => setMessage(null)}
            className="ml-auto text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Event Editor Form (Modal / Inline Card) */}
      {editingEvent && (
        <Card variant="glass" className="p-6 border-emerald-200/80 shadow-apple-md space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                {isNew ? <Plus className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              </span>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {isNew ? 'Create New Class Event' : 'Edit Event Details'}
                </h3>
                <p className="text-[11px] text-slate-500">
                  Fill in the details below. Published events appear immediately on the public Events page.
                </p>
              </div>
            </div>
            <button
              onClick={handleCancelEdit}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className={labelCls}>
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. NMS 08 2026 Grand Reunion & Annual General Meeting"
                value={editingEvent.title || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, title: e.target.value })}
              />
            </div>

            {/* Category */}
            <div>
              <label className={labelCls}>
                <Tag className="w-3.5 h-3.5 text-slate-400" /> Event Category
              </label>
              <select
                className={inputCls}
                value={editingEvent.category || 'Reunion'}
                onChange={(e) => setEditingEvent({ ...editingEvent, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Event Date */}
            <div>
              <label className={labelCls}>
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                className={inputCls}
                value={editingEvent.event_date || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, event_date: e.target.value })}
              />
            </div>

            {/* Event Time */}
            <div>
              <label className={labelCls}>
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Event Time
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. 10:00 AM WAT / 18:00 Hours"
                value={editingEvent.event_time || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, event_time: e.target.value })}
              />
            </div>

            {/* Location / Venue */}
            <div>
              <label className={labelCls}>
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> Venue / Location
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Transcorp Hilton, Abuja / Zaria Chindit Cantonment"
                value={editingEvent.location || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, location: e.target.value })}
              />
            </div>

            {/* Organizer */}
            <div className="md:col-span-2">
              <label className={labelCls}>Organizing Committee / Host</label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. 2026 Reunion Planning Committee or National Secretariat"
                value={editingEvent.organizer || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, organizer: e.target.value })}
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className={labelCls}>Event Description &amp; Schedule Details</label>
              <textarea
                rows={4}
                className={inputCls}
                placeholder="Provide event overview, dress code, banquet details, schedule, RSVP contacts, and attendance guidelines..."
                value={editingEvent.description || ''}
                onChange={(e) => setEditingEvent({ ...editingEvent, description: e.target.value })}
              />
            </div>

            {/* Event Picture / Flyer Upload */}
            <div className="md:col-span-2 space-y-3">
              <label className={labelCls}>
                <ImageIcon className="w-3.5 h-3.5 text-slate-400" /> Event Picture / Flyer
              </label>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={handleImageFileChange}
                />

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  icon={<Upload className="w-4 h-4 text-emerald-600" />}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                >
                  {uploadingImage ? 'Uploading Picture...' : 'Upload Picture / Flyer'}
                </Button>

                <span className="text-xs text-slate-400">or enter an image URL directly:</span>

                <input
                  type="url"
                  className={`${inputCls} sm:flex-1`}
                  placeholder="https://example.com/event-flyer.jpg"
                  value={editingEvent.image_url || ''}
                  onChange={(e) => setEditingEvent({ ...editingEvent, image_url: e.target.value })}
                />
              </div>

              {/* Picture Preview */}
              {editingEvent.image_url && (
                <div className="relative mt-2 inline-block rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 p-2 shadow-sm">
                  <div className="relative w-48 h-32 overflow-hidden rounded-xl bg-slate-200">
                    <img
                      src={editingEvent.image_url}
                      alt="Event flyer preview"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditingEvent({ ...editingEvent, image_url: '' })}
                    className="absolute top-3 right-3 p-1 rounded-full bg-slate-900/70 text-white hover:bg-red-600 transition-colors"
                    title="Remove picture"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                  <p className="text-[10px] text-slate-500 mt-1.5 text-center font-medium">
                    Picture attached
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-100">
            <Button
              variant="emerald"
              size="sm"
              icon={<Send className="w-3.5 h-3.5" />}
              onClick={() => handleSave(true)}
              disabled={saving}
            >
              {saving ? 'Publishing...' : 'Publish Event'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              icon={<Save className="w-3.5 h-3.5" />}
              onClick={() => handleSave(false)}
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 font-medium ml-auto px-3 py-2 rounded-xl transition-colors"
            >
              Cancel
            </button>
          </div>
        </Card>
      )}

      {/* Events List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            Published &amp; Scheduled Events ({events.length})
          </span>
          <span>Shown chronologically</span>
        </div>

        {loading ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-8 h-8 border-2 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Loading events directory...</p>
          </div>
        ) : events.length === 0 ? (
          <Card variant="glass" className="p-8 text-center space-y-3">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-bold text-slate-800">No Events Created Yet</h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Click &quot;Create Event&quot; above to schedule the first alumni event, reunion, or dinner with flyers and details.
            </p>
            <Button
              variant="emerald"
              size="sm"
              icon={<Plus className="w-3.5 h-3.5" />}
              onClick={handleStartNew}
            >
              Create First Event
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {events.map((event) => (
              <Card
                key={event.id}
                variant="glass"
                className="p-4 flex flex-col justify-between space-y-4 hover:border-emerald-200 transition-all shadow-apple-sm"
              >
                <div className="flex items-start gap-4">
                  {/* Picture / Flyer thumbnail */}
                  <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 relative flex items-center justify-center">
                    {event.image_url ? (
                      <img
                        src={event.image_url}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Calendar className="w-8 h-8 text-slate-300" />
                    )}
                  </div>

                  {/* Event details */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="emerald" size="sm">
                        {event.category || 'General'}
                      </Badge>
                      {event.status === 'draft' && (
                        <Badge variant="amber" size="sm">
                          Draft
                        </Badge>
                      )}
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold text-slate-900 truncate" title={event.title}>
                      {event.title}
                    </h4>

                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-0.5">
                      <span className="flex items-center gap-1 font-semibold text-slate-700">
                        <Calendar className="w-3 h-3 text-emerald-600" />
                        {event.event_date}
                      </span>
                      {event.event_time && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {event.event_time}
                        </span>
                      )}
                    </div>

                    {event.location && (
                      <p className="text-[11px] text-slate-500 flex items-center gap-1 truncate">
                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                        {event.location}
                      </p>
                    )}
                  </div>
                </div>

                {/* Description snippet */}
                {event.description && (
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed bg-slate-50/70 p-2.5 rounded-xl border border-slate-100">
                    {event.description}
                  </p>
                )}

                {/* Card actions */}
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400">
                    Host: {event.organizer || 'Secretariat'}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Edit3 className="w-3.5 h-3.5" />}
                      onClick={() => handleStartEdit(event)}
                    >
                      Edit
                    </Button>
                    <button
                      onClick={() => handleDelete(event.id, event.title)}
                      className="p-1.5 rounded-xl text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      title="Delete event"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
