import { GeoapifyContext, GeoapifyGeocoderAutocomplete } from "@geoapify/react-geocoder-autocomplete";
import axios from "axios";
import React, { useMemo, useRef, useState } from 'react';
import toast from "react-hot-toast";
import config from "../../config";
import { io } from "socket.io-client";
import { PaperAirplaneIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
const GEOAPIFY_API_KEY = import.meta.env.VITE_GEOAPIFY_API_KEY;
const EVENT_CATEGORIES = ['Social', 'Wellness', 'Creative', 'Volunteering', 'Therapeutic', 'Peer-Led', 'Educational'];
const LIFE_EVENTS = ["Started or lost a job", "Moved to a new city", "Major relationship change", "Serious health issue (self / family)"];
const SEVERITY_LEVELS = ['Any', 'Normal', 'Mild', 'Moderate', 'Severe'];

const DYNAMIC_FORM_CONFIG = {
  'Social': { showInterests: true },
  'Wellness': { showInterests: true },
  'Creative': { showInterests: true },
  'Volunteering': { showInterests: false },
  'Therapeutic': { showLifeTransitions: true, showSeverity: true },
  'Peer-Led': { showLifeTransitions: true, showSeverity: true },
  'Educational': { showLifeTransitions: true, showSeverity: true },
};


const HostEvent = ({ onClose , onSuccess}) => {
  const [placeSelected, setPlaceSelected] = useState(false)
  const [address, setAddress] = useState("")
  const socketRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false)

  const [form, setForm] = useState({
    title: '',
    date: '',
    time: '',
    capacity: '',
    location: '',
    activities: [],
    eventType: EVENT_CATEGORIES[0],
    lifeTransitions: [],
    phq9Severity: 'Any',
    gad7Severity: 'Any',
  });

  const visibleFields = useMemo(() => {
    return DYNAMIC_FORM_CONFIG[form.eventType] || {};
  }, [form.eventType]);


  const checkDate = (dateString) => {
    const selectedDate = new Date(dateString)
    const currDate = new Date()
    const maxDate = new Date(currDate);
    maxDate.setDate(currDate.getDate() + 31);
    currDate.setHours(0, 0, 0, 0);
    if (selectedDate < currDate || selectedDate > maxDate) { return true }
    return false
  }

  const activityOptions = [
    "Music & Concerts", "Dance / Performing Arts", "Outdoor Fitness",
    "Mindfulness & Yoga", "Volunteering", "Art & Craft", "Community Sports"
  ];

  const handleFormChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleActivityChange = e => {
    const { value, checked } = e.target;
    if (checked) {
      setForm(prev => ({ ...prev, activities: [...prev.activities, value] }));
    } else {
      setForm(prev => ({ ...prev, activities: prev.activities.filter(activity => activity !== value) }));
    }
  };

  const handleLifeTransitionChange = e => {
    const { value, checked } = e.target;
    if (checked) {
      setForm(prev => ({ ...prev, lifeTransitions: [...prev.lifeTransitions, value] }));
    } else {
      setForm(prev => ({ ...prev, lifeTransitions: prev.lifeTransitions.filter(item => item !== value) }));
    }
  };

  function onPlaceSelect(value) {
    setAddress(value.properties.formatted)
    setForm(prev => ({ ...prev, location: value?.properties || '' }))
    setPlaceSelected(true)
  }

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!placeSelected) return toast.error("Please select a location from the dropdown!");
    if (checkDate(form.date)) return toast.error("Event date cannot be in the past or more than 30 days ahead.");
    if (form.capacity < 1) return toast.error("Capacity cannot be less than 1.");

    if (visibleFields.showInterests && form.activities.length === 0) {
      return toast.error("Please select at least one activity/interest.");
    }
    if (visibleFields.showLifeTransitions && form.lifeTransitions.length === 0) {
      return toast.error("Please select at least one life transition.");
    }

    const payload = {
      title: form.title,
      description: `Event on ${form.date}`,
      eventType: form.eventType,
      eventDate: `${form.date}T${form.time}`,
      capacity: form.capacity,
      location: form.location,
      ...(visibleFields.showInterests && { targetInterests: form.activities }),
      ...(visibleFields.showLifeTransitions && { targetLifeTransitions: form.lifeTransitions }),
      ...(visibleFields.showSeverity && {
        targetPHQ9Severity: form.phq9Severity,
        targetGAD7Severity: form.gad7Severity,
      }),
    };

    if (payload.eventType === 'Volunteering') {
      payload.targetInterests = ['Volunteering'];
    }

    try {
      setIsLoading(true)
      const res = await axios.post(`${config.API_URL}/events/hostevent`, payload, {
        headers: { "Content-Type": "application/json" }
      })
      const { status, message, groupIds, eventId } = res.data
      if (status) {

        if (groupIds.length > 0) {
          groupIds.forEach(grpID => {
            socketRef.current = io('http://localhost:3000/community', {
              auth: { group_id: grpID },
            });
            const messageData = {
              groupId: grpID,
              senderId: eventId,
              message: "New Event Invitation",
              timestamp: new Date(),
              senderName: "System",
              messageType: 'system'
            };

            socketRef.current.emit('sendMessage', messageData, (response) => {
              if (response.status === 'ok') {
                console.log("Event Alert send")
              } else {
                toast.error(response.message);
              }
            });
          });
        }

        toast.success(message);
        onClose();
        setForm({ title: '', date: '', time: '', capacity: '', location: '', activities: [], eventType: 'Social', lifeTransitions: [], phq9Severity: 'Any', gad7Severity: 'Any' });
        setAddress('');
        setPlaceSelected(false);
        onSuccess()
      } else {
        toast.error(message);
      }
    } catch (error) {
      console.log(error.message)
      toast.error("Server request failed. Please retry.")
    } finally {
      setIsLoading(false)
    }
  };

  return (
    <section className="mb-12">
      <form onSubmit={handleFormSubmit} className="bg-neutral-900 border border-neutral-800 rounded-lg p-6 sm:p-8 space-y-6">

        <div>
          <h2 className="text-xl font-bold text-white">Host a New Event</h2>
          <p className="text-sm text-neutral-400 mt-1">Fill out the details below to schedule a new event.</p>
        </div>

        <div className="h-px bg-neutral-800"></div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="eventType" className="block text-sm font-medium text-neutral-400 mb-2">Event Category</label>
            <select id="eventType" name="eventType" value={form.eventType} onChange={handleFormChange} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors">
              {EVENT_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-neutral-400 mb-2">Event Title</label>
            <input id="title" name="title" value={form.title} onChange={handleFormChange} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors" placeholder="e.g., Mindfulness Workshop" required />
          </div>
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-neutral-400 mb-2">Date</label>
            <input id="date" type="date" name="date" value={form.date} onChange={handleFormChange} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors" required />
          </div>
          <div>
            <label htmlFor="time" className="block text-sm font-medium text-neutral-400 mb-2">Time</label>
            <input id="time" type="time" name="time" value={form.time} onChange={handleFormChange} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors" required />
          </div>
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-neutral-400 mb-2">Capacity</label>
            <input id="capacity" type="number" name="capacity" value={form.capacity} onChange={handleFormChange} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder:text-neutral-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors" placeholder="e.g., 50" min="1" required />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-neutral-400 mb-2">Location</label>
            
            <div className="w-full bg-neutral-800 border border-neutral-700 rounded-lg focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500 transition-colors">
              <GeoapifyContext apiKey={GEOAPIFY_API_KEY}>
                <GeoapifyGeocoderAutocomplete placeholder="Enter city or address in India" lang="en" filterByCountryCode={["in"]} limit={5} placeSelect={onPlaceSelect} value={address}
                  suggestionsChange={() => { setAddress(''); setPlaceSelected(false); setForm(prev => ({ ...prev, location: '' })); }}
                />
              </GeoapifyContext>
            </div>
          </div>
        </div>

        {visibleFields.showInterests && (
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
            <label className="block text-sm font-semibold text-white mb-3">Target Interests</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {activityOptions.map(activity => (
                <div key={activity} className="flex items-center">
                  <input type="checkbox" id={activity} name="activities" value={activity} checked={form.activities.includes(activity)} onChange={handleActivityChange} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-sky-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500" />
                  <label htmlFor={activity} className="ml-2 text-sm text-neutral-300">{activity}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleFields.showLifeTransitions && (
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
            <label className="block text-sm font-semibold text-white mb-3">Target Life Transitions</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {LIFE_EVENTS.map(event => (
                <div key={event} className="flex items-center">
                  <input type="checkbox" id={event} name="lifeTransitions" value={event} checked={form.lifeTransitions.includes(event)} onChange={handleLifeTransitionChange} className="h-4 w-4 rounded bg-neutral-700 border-neutral-600 text-sky-600 focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-sky-500" />
                  <label htmlFor={event} className="ml-2 text-sm text-neutral-300">{event}</label>
                </div>
              ))}
            </div>
          </div>
        )}

        {visibleFields.showSeverity && (
          <div className="bg-neutral-800/50 border border-neutral-700 rounded-lg p-4">
            <label className="block text-sm font-semibold text-white mb-3">Target Severity</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="phq9Severity" className="block text-sm font-medium text-neutral-400 mb-2">Depression (PHQ-9)</label>
                <select id="phq9Severity" name="phq9Severity" value={form.phq9Severity} onChange={handleFormChange} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors">
                  {SEVERITY_LEVELS.map(level => <option key={`phq9-${level}`} value={level}>{level}</option>)}
                </select>
              </div>
              <div>
                <label htmlFor="gad7Severity" className="block text-sm font-medium text-neutral-400 mb-2">Anxiety (GAD-7)</label>
                <select id="gad7Severity" name="gad7Severity" value={form.gad7Severity} onChange={handleFormChange} className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors">
                  {SEVERITY_LEVELS.map(level => <option key={`gad7-${level}`} value={level}>{level}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        <div className="pt-4 flex justify-end">
          <button type="submit" className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-sky-600 text-white font-semibold rounded-lg shadow-md hover:bg-sky-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-neutral-900 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <ArrowPathIcon className="h-5 w-5 animate-spin" />
                <span>Hosting Event...</span>
              </>
            ) : (
              <>
                <PaperAirplaneIcon className="h-5 w-5" />
                <span>Host Event</span>
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
};

export default HostEvent;