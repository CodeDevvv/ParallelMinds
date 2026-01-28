import { useState } from 'react';
import PropTypes from 'prop-types';
import { Star, X } from 'lucide-react';
import axios from 'axios';
import config from '../../../config';
import toast from 'react-hot-toast';

const FeedbackForm = ({ isOpen, onClose, eventId, submitted }) => {
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [comment, setComment] = useState('');

    if (!isOpen) return null;
    if (!eventId) return null;
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            toast.error('Please select a rating before submitting.');
            return;
        }
        const feedback = {
            rating,
            comment,
            eventId
        }
        try {
            const response = await axios.post(`${config.API_URL}/api/user/submitFeedback`, feedback, {
                withCredentials: true
            })
            const { status, message } = response.data
            if (status) {
                toast.success(message || "Feedback submitted, Thank you")
                submitted()
            } else {
                toast.error(message)
            }
        } catch (error) {
            console.log(error.message)
            toast.error("Server request failed. Please retry.")
        }
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 p-4 backdrop-blur-sm"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-md transform rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all dark:bg-neutral-800"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 rounded-full p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-neutral-100"
                >
                    <X size={20} />
                </button>

                <div className="mb-6 text-center">
                    <h3 className="text-2xl font-bold leading-6 text-gray-900 dark:text-neutral-100">
                        Share Your Feedback
                    </h3>
                    <p className="mt-2 text-sm text-gray-500 dark:text-neutral-400">
                        How was your experience with this event?
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="mb-6">
                        <p className="mb-3 text-center font-medium text-gray-700 dark:text-neutral-300">
                            Your Rating
                        </p>
                        <div className="flex justify-center gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    size={40}
                                    className={`cursor-pointer transition-all duration-150 ${(hoverRating || rating) >= star
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300 dark:text-neutral-600'
                                        }`}
                                    onMouseEnter={() => setHoverRating(star)}
                                    onMouseLeave={() => setHoverRating(0)}
                                    onClick={() => setRating(star)}
                                />
                            ))}
                        </div>
                    </div>

                    <div className="mb-6">
                        <label
                            htmlFor="message"
                            className="mb-2 block text-sm font-medium text-gray-700 dark:text-neutral-300"
                        >
                            Message (Optional)
                        </label>
                        <textarea
                            id="message"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            rows={4}
                            placeholder="Tell us what you liked or what could be improved..."
                            className="w-full rounded-md border-gray-300 bg-gray-50 p-3 text-gray-800 transition focus:border-sky-500 focus:ring-sky-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-400"
                        />
                    </div>

                    <div className="flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:text-neutral-300 dark:hover:bg-neutral-700"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="rounded-md bg-sky-600 px-6 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 disabled:cursor-not-allowed disabled:bg-sky-800 disabled:opacity-60"
                            disabled={rating === 0}
                        >
                            Submit
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

FeedbackForm.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    eventId: PropTypes.string,
    submitted: PropTypes.func
};

export default FeedbackForm;