import axios from "axios";
import toast from "react-hot-toast";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

import config from "../../config";
import { useLoading } from "../../store";
import ProcessingLoader from "../../ui/ProcessingLoader";

// PHQ-9 – depression (0–27)
const PHQ9 = [
    "Little interest or pleasure in doing things",
    "Feeling down, depressed, or hopeless",
    "Trouble falling/staying asleep, or sleeping too much",
    "Feeling tired or having little energy",
    "Poor appetite or overeating",
    "Feeling bad about yourself — or that you’re a failure",
    "Trouble concentrating on things",
    "Moving / speaking so slowly others noticed, or being fidgety / restless",
    "Thoughts that you would be better off dead or of hurting yourself"
];
// GAD-7 – anxiety (0–21)
const GAD7 = [
    "Feeling nervous, anxious, or on edge",
    "Not being able to stop or control worrying",
    "Worrying too much about different things",
    "Trouble relaxing",
    "Being so restless that it is hard to sit still",
    "Becoming easily annoyed or irritable",
    "Feeling afraid as if something awful might happen"
];
// Life-transition events (check all that apply – max 4 shown)
const LIFE_EVENTS = [
    "Started or lost a job",
    "Moved to a new city",
    "Major relationship change",
    "Serious health issue (self / family)"
];

// Interest tags (multi-select)
const INTERESTS = [
    "Music & Concerts",
    "Dance / Performing Arts",
    "Outdoor Fitness",
    "Mindfulness & Yoga",
    "Volunteering",
    "Art & Craft",
    "Community Sports"
];

export default function UserQuestionnaire() {
    const navigate = useNavigate();
    const { isLoading, setIsLoading } = useLoading()
    /* UI state */
    const [accepted, setAccepted] = useState(false);
    const [section, setSection] = useState(0);              // 0=PHQ-9,1=GAD-7,2=Life,3=Interests,4=review
    const [answers, setAnswers] = useState({
        phq9: Array(9).fill(null),
        gad7: Array(7).fill(null),
        life: [],
        interests: []
    });

    const phqTotal = answers.phq9.reduce((a, v) => a + (v ?? 0), 0);   // 0-27
    const gadTotal = answers.gad7.reduce((a, v) => a + (v ?? 0), 0);   // 0-21
    const allAnsweredPHQ = answers.phq9.every(v => v !== null);
    const allAnsweredGAD = answers.gad7.every(v => v !== null);

    const handleCancel = async () => {
        try {
            const res = await axios.get(`${config.API_URL}/api/auth/logout?role=User`, { withCredentials: true })
            const { status, message } = res.data
            if (status) {
                navigate("/")
            } else {
                toast.error(message)
            }
        } catch (error) {
            console.log(error.message)
            toast.error("Server request failed. Please retry.")
        }
    };

    const recordRadio = (arrKey, index, value) => {
        setAnswers(prev => {
            const copy = [...prev[arrKey]];
            copy[index] = value;
            return { ...prev, [arrKey]: copy };
        });
    };

    const toggleCheckbox = (arrKey, label) => {
        setAnswers(prev => {
            const exists = prev[arrKey].includes(label);
            const nextArr = exists
                ? prev[arrKey].filter(l => l !== label)
                : [...prev[arrKey], label];
            return { ...prev, [arrKey]: nextArr };
        });
    };

    const handleSubmit = async () => {
        try {
            setIsLoading(true)
            const payload = {
                phq9Total: phqTotal,
                gad7Total: gadTotal,
                lifeEvents: answers.life,
                interests: answers.interests
            };
            const res = await axios.post(`${config.API_URL}/api/auth/submitQuestionaire`, payload, { withCredentials: true })
            const { status, message, isCompleted } = res.data
            if (status || isCompleted) {
                toast.success(message);
                navigate("/");
            }
            else {
                toast.error(message)
            }
        } catch (error) {
            console.log(error.message)
            toast.error("Server request failed. Please retry.")
        } finally {
            setIsLoading(false)
        }
    };

    const optionButtons = [0, 1, 2, 3].map(score => {
        const lbl = ["Not at all", "Several days", ">½ days", "Nearly every day"][score];
        return { score, lbl };
    });

    if (!accepted) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#121212] p-6">
                <div className="max-w-2xl text-center space-y-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-snug">
                        Mandatory Assessment&nbsp;
                        <span className="text-[#4F8CFF]">for Better Matching</span>
                    </h1>
                    <p className="text-lg text-[#B8B8B8]">
                        This short questionnaire helps us connect you with the most
                        relevant resources and events. It takes&nbsp;
                        <strong className="text-white">about 3 minutes</strong> to complete.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                        <button
                            className="bg-gradient-to-r from-[#4F8CFF] to-[#7B68EE] text-white px-8 py-3 rounded-lg shadow-md hover:shadow-lg transform hover:scale-105 transition"
                            onClick={() => setAccepted(true)}
                        >
                            Okay, continue
                        </button>
                        <button
                            className="text-[#B8B8B8] hover:text-[#F472B6] hover:underline transition"
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (

        isLoading ?
            <ProcessingLoader overlay />
            :
            (<div className="min-h-screen flex flex-col bg-[#121212] text-white">
                <header className="sticky top-0 z-10 bg-[#121212]/90 backdrop-blur border-b border-[#333]">
                    <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
                        <span className="text-sm text-[#B8B8B8]">
                            {section < 4
                                ? `Step ${section + 1} of 4`
                                : "Review & Submit"}
                        </span>
                        {section > 0 && (
                            <button
                                onClick={() => setSection(s => s - 1)}
                                className="text-[#B8B8B8] hover:text-[#4F8CFF] text-sm"
                            >
                                ← Back
                            </button>
                        )}
                    </div>
                </header>

                <main className="flex-1 flex items-center justify-center px-6 py-12">
                    {/* -------------------- PHQ-9 -------------------- */}
                    {section === 0 && (
                        <div className="w-full max-w-3xl space-y-8">
                            <h2 className="text-2xl font-semibold mb-4">
                                Let’s Get to Know You
                            </h2>

                            {PHQ9.map((q, i) => (
                                <div key={i} className="space-y-3">
                                    <p className="font-medium">{i + 1}. {q}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {optionButtons.map(({ score, lbl }) => (
                                            <label
                                                key={score}
                                                className={`border-2 rounded-lg p-3 text-center cursor-pointer transition
                        ${answers.phq9[i] === score
                                                        ? "border-[#4F8CFF] bg-[#4F8CFF]/10"
                                                        : "border-[#444] hover:border-[#4F8CFF]/60"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`phq-${i}`}
                                                    className="sr-only"
                                                    onChange={() => recordRadio("phq9", i, score)}
                                                />
                                                <span>{lbl}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="text-right">
                                <button
                                    disabled={!allAnsweredPHQ}
                                    onClick={() => setSection(1)}
                                    className="bg-[#4F8CFF] disabled:opacity-40 text-black px-8 py-3 rounded-lg hover:bg-[#7B68EE] transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* -------------------- GAD-7 -------------------- */}
                    {section === 1 && (
                        <div className="w-full max-w-3xl space-y-8">
                            <h2 className="text-2xl font-semibold mb-4">
                                How Have You Been Feeling Lately?
                            </h2>

                            {GAD7.map((q, i) => (
                                <div key={i} className="space-y-3">
                                    <p className="font-medium">{i + 1}. {q}</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                        {optionButtons.map(({ score, lbl }) => (
                                            <label
                                                key={score}
                                                className={`border-2 rounded-lg p-3 text-center cursor-pointer transition
                        ${answers.gad7[i] === score
                                                        ? "border-[#4F8CFF] bg-[#4F8CFF]/10"
                                                        : "border-[#444] hover:border-[#4F8CFF]/60"}`}
                                            >
                                                <input
                                                    type="radio"
                                                    name={`gad-${i}`}
                                                    className="sr-only"
                                                    onChange={() => recordRadio("gad7", i, score)}
                                                />
                                                <span>{lbl}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <div className="text-right">
                                <button
                                    disabled={!allAnsweredGAD}
                                    onClick={() => setSection(2)}
                                    className="bg-[#4F8CFF] disabled:opacity-40 text-black px-8 py-3 rounded-lg hover:bg-[#7B68EE] transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* -------------------- Life Transitions -------------------- */}
                    {section === 2 && (
                        <div className="w-full max-w-2xl space-y-6">
                            <h2 className="text-2xl font-semibold">
                                Recent Major Life Events
                            </h2>
                            <p className="text-[#B8B8B8]">
                                Select any significant changes you&apos;e experienced in the past year.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {LIFE_EVENTS.map(evt => (
                                    <label
                                        key={evt}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition
                    ${answers.life.includes(evt)
                                                ? "border-[#4F8CFF] bg-[#4F8CFF]/10"
                                                : "border-[#444] hover:border-[#4F8CFF]/60"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            onChange={() => toggleCheckbox("life", evt)}
                                        />
                                        {evt}
                                    </label>
                                ))}
                            </div>

                            <div className="text-right">
                                <button
                                    onClick={() => setSection(3)}
                                    className="bg-[#4F8CFF] text-black px-8 py-3 rounded-lg hover:bg-[#7B68EE] transition"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}

                    {/* -------------------- Interests -------------------- */}
                    {section === 3 && (
                        <div className="w-full max-w-2xl space-y-6">
                            <h2 className="text-2xl font-semibold">Interests</h2>
                            <p className="text-[#B8B8B8]">
                                Choose the activities you enjoy – this helps us suggest relevant events.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {INTERESTS.map(int => (
                                    <label
                                        key={int}
                                        className={`border-2 rounded-lg p-4 cursor-pointer transition
                    ${answers.interests.includes(int)
                                                ? "border-[#4F8CFF] bg-[#4F8CFF]/10"
                                                : "border-[#444] hover:border-[#4F8CFF]/60"}`}
                                    >
                                        <input
                                            type="checkbox"
                                            className="sr-only"
                                            onChange={() => toggleCheckbox("interests", int)}
                                        />
                                        {int}
                                    </label>
                                ))}
                            </div>

                            <div className="text-right">
                                <button
                                    onClick={() => setSection(4)}
                                    className="bg-[#4F8CFF] text-black px-8 py-3 rounded-lg hover:bg-[#7B68EE] transition"
                                >
                                    Review →
                                </button>
                            </div>
                        </div>
                    )}

                    {/* -------------------- Review & Submit -------------------- */}
                    {section === 4 && (
                        <section className="w-full max-w-lg space-y-8 text-center">
                            <h2 className="text-3xl font-bold text-white">You’re All Set!</h2>
                            <p className="text-[#B8B8B8]">
                                We’ve received your responses and will tailor your experience accordingly.
                                Thanks for sharing!
                            </p>
                            <button
                                onClick={handleSubmit}
                                className="w-full bg-gradient-to-r from-[#4F8CFF] to-[#7B68EE] text-white font-semibold py-3 rounded-lg hover:shadow-lg transition"
                            >
                                Finish & Continue
                            </button>
                        </section>

                    )}
                </main>
            </div>)
    );
}
