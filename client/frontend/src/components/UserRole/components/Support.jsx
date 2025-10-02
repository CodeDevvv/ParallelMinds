import { useEffect, useState } from 'react';
import { LifeBuoy, Mail, HelpCircle, ChevronDown, Send, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import TicketItem from './SupportHistory';
import axios from 'axios';
import config from '../../../config';


const Support = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [issueType, setIssueType] = useState('General Enquiry');
  const [subject, setSubject] = useState('');
  const [query, setQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [queryHistory, setQueryHistory] = useState([])

  const handleToggleForm = () => {
    setIsFormVisible(!isFormVisible);
  };

  const handleCancel = () => {
    setIsFormVisible(false);
    setSubject('');
    setQuery('');
    setIssueType('General Enquiry');
  };

  const fetchQueries = async () => {
    try {
      const response = await axios.get(`${config.API_URL}/api/support/fetchQueryHistory`, {
        withCredentials: true
      })
      if (response.data.status) {
        setQueryHistory(response.data.queryHistory)
      } else {
        toast.error("Something went wrong!")
      }
    } catch (error) {
      console.log(error.message)
      toast.error("Server request failed. Please retry.")
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!subject.trim() || !query.trim()) {
      toast.error('Please fill out both the subject and query fields.');
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await axios.post(`${config.API_URL}/api/support/submitQuery`, { issueType, subject, query }, {
        withCredentials: true
      })
      const { status, message } = response.data
      if (status) {
        toast.success(message)
        await fetchQueries()
      } else {
        toast.error(message)
      }
    } catch (error) {
      console.log(error.message)
      toast.error("Server request failed. Please retry.")
    } finally {
      setIsSubmitting(false)
    }
    handleCancel();
  };

  useEffect(() => {
    fetchQueries()
  }, [])

  return (
    <div className="flex-1 bg-neutral-900 text-white p-6 md:p-8 ml-64 lg:p-10">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <LifeBuoy className="mx-auto h-16 w-16 text-sky-400 mb-4 animate-pulse" />
          <h1 className="text-4xl font-bold text-neutral-100">Contact Support</h1>
          <p className="text-neutral-400 mt-2 text-lg">
            We&apos;re here to help. Reach out to us with any questions or issues.
          </p>
        </header>

        <div className="bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg mb-12">
          <div className="p-8">
            <div className="flex flex-col md:flex-row items-center text-center md:text-left">
              <Mail className="h-12 w-12 text-sky-400 mb-4 md:mb-0 md:mr-6 flex-shrink-0" />
              <div>
                <h2 className="text-2xl font-bold text-neutral-100">Send us your Query</h2>
                <p className="text-neutral-300 mt-1 mb-4">
                  This is the best way to get in touch. We aim to reply within 24 hours.
                </p>
                <button
                  onClick={handleToggleForm}
                  className="inline-block bg-sky-600 hover:bg-sky-500 text-white font-bold py-3 px-6 rounded-lg transition-colors text-lg"
                >
                  {isFormVisible ? 'Close Form' : 'Write your query'}
                </button>
              </div>
            </div>
          </div>

          {isFormVisible && (
            <div className="border-t border-neutral-700 p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="issueType" className="block text-sm font-medium text-neutral-300 mb-2">
                    What is your main issue?
                  </label>
                  <div className="relative">
                    <select
                      id="issueType"
                      value={issueType}
                      onChange={(e) => setIssueType(e.target.value)}
                      className="w-full appearance-none rounded-md border-neutral-600 bg-neutral-700 p-3 pr-10 text-white focus:border-sky-500 focus:ring-sky-500"
                    >
                      <option>General Enquiry</option>
                      <option>Group Issue</option>
                      <option>Event Issue</option>
                      <option>Profile Issue</option>
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-neutral-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-neutral-300 mb-2">
                    Subject
                  </label>
                  <input
                    type="text"
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g., Trouble finding my group chat"
                    className="w-full rounded-md border-neutral-600 bg-neutral-700 p-3 text-white focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label htmlFor="query" className="block text-sm font-medium text-neutral-300 mb-2">
                    Query
                  </label>
                  <textarea
                    id="query"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={6}
                    placeholder="Please describe your issue in detail..."
                    className="w-full rounded-md border-neutral-600 bg-neutral-700 p-3 text-white focus:border-sky-500 focus:ring-sky-500"
                  />
                </div>
                <div className="flex items-center justify-end gap-4">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="rounded-md px-4 py-2 text-sm font-semibold text-neutral-300 hover:bg-neutral-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center gap-2 rounded-md bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-sky-500 disabled:cursor-not-allowed disabled:bg-sky-800 disabled:opacity-60"
                  >
                    <Send size={16} />
                    {isSubmitting ? 'Sending...' : 'Send Query'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="bg-neutral-800/50 border border-neutral-700/50 rounded-lg">
          <h2 className="text-2xl font-bold text-neutral-100 p-6 flex items-center">
            <Clock className="mr-3 text-sky-400" />
            Your Ticket History
          </h2>
          <div className="border-t border-neutral-700">
            {
              queryHistory.length === 0 ? <div className='h-20 flex items-center justify-center opacity-25'>
                <h1>No Tickets.</h1>
              </div> :
                queryHistory.map(ticket => (
                  <TicketItem key={ticket._id} ticket={ticket} />
                ))}
          </div>
        </div>


        <div className="mt-12 bg-neutral-800/50 border border-neutral-700/50 p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-neutral-100 mb-6 flex items-center">
            <HelpCircle className="mr-3 text-sky-400" />
            Frequently Asked Questions
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg text-neutral-200">How do I change my group?</h3>
              <p className="text-neutral-400 mt-1">
                Currently, group assignments are handled by the system to ensure the best match. If you have a serious issue with your group, please contact support directly.
              </p>
            </div>
            <div className="border-t border-neutral-700/50"></div>
            <div>
              <h3 className="font-semibold text-lg text-neutral-200">Is my data secure?</h3>
              <p className="text-neutral-400 mt-1">
                Yes, we take your privacy very seriously. All personal data and chat histories are encrypted and stored securely.
              </p>
            </div>
            <div className="border-t border-neutral-700/50"></div>
            <div>
              <h3 className="font-semibold text-lg text-neutral-200">How are events matched to my group?</h3>
              <p className="text-neutral-400 mt-1">
                Events are matched based on a combination of your group&apos;s shared interests, location, and other contextual factors to provide the most relevant recommendations.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Support;