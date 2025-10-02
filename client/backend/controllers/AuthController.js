import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import { generateToken, verifyToken } from '../utils/generateToken.js';
import { getGAD7Category, getPHQ9Category, isWithinRange, jaccardSimilarity } from '../utils/helperFunctions.js';

import UserModel from '../models/UserModel.js';
import Doctor from '../models/DoctorModel.js';
import WeightModel from '../models/WeightModel.js';
import GroupModel from '../models/GroupModel.js';
import { addLog } from './LogController.js';

// User Login 
export const userLogin = async (req, res) => {
    const { email, password } = req.body;
    const session = await mongoose.startSession();
    try {
        const user = await UserModel.findOne({ email });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.json({
                status: false,
                message: "Invalid credentials. Please check your email and password."
            });
        }

        session.startTransaction();
        if (!user.groupId && user.questionnaire?.completed) {
            let groupId = await matchGroup(
                user.questionnaire.phq9Assessment.totalScore,
                user.questionnaire.gad7Assessment.totalScore,
                user.questionnaire.lifeTransitions.responses,
                user.questionnaire.interests.responses,
                user.location.coordinates
            )

            let groupUpdate = null;
            if (!groupId) {
                groupUpdate = await GroupModel.create({
                    membersId: [user._id],
                    groupProfile: {
                        commonLifeTransitions: user.questionnaire.lifeTransitions.responses,
                        sharedInterests: user.questionnaire.interests.responses,
                        avgPHQ9Score: user.questionnaire.phq9Assessment.totalScore,
                        avgGAD7Score: user.questionnaire.gad7Assessment.totalScore,
                        centralCoordinates: {
                            type: "Point",
                            coordinates: user.location.coordinates
                        }
                    },
                    settings: {
                        maxSize: 10,
                        currentSize: 1,
                        isOpen: true
                    }
                }, { session });

                if (!groupUpdate) {
                    await session.abortTransaction();
                    return res.json({
                        status: false,
                        message: "An error occurred while creating a support group. Please try again later."
                    });
                }

                groupId = groupUpdate._id;
                const updatedUser = await UserModel.updateOne(
                    { _id: user._id },
                    { $set: { groupId } },
                    { session }
                );

                if (!updatedUser.modifiedCount) {
                    await session.abortTransaction();
                    return res.json({
                        status: false,
                        message: "Failed to assign you to a group. Please try again later."
                    });
                }
            } else {
                const grp = await GroupModel.findOne({ _id: groupId }).session(session);
                const newSize = grp.settings.currentSize + 1;

                const newAvgPHQ9 = ((grp.groupProfile.avgPHQ9Score * grp.settings.currentSize) + user.questionnaire.phq9Assessment.totalScore) / newSize;
                const newAvgGAD7 = ((grp.groupProfile.avgGAD7Score * grp.settings.currentSize) + user.questionnaire.gad7Assessment.totalScore) / newSize;

                const updatedSharedInterests = Array.from(new Set([
                    ...grp.groupProfile.sharedInterests,
                    ...user.questionnaire.interests.responses
                ]));

                const updatedLifeTransitions = Array.from(new Set([
                    ...grp.groupProfile.commonLifeTransitions,
                    ...user.questionnaire.lifeTransitions.responses
                ]));

                groupUpdate = await GroupModel.updateOne(
                    { _id: groupId },
                    {
                        $push: { membersId: user._id },
                        $set: {
                            "settings.currentSize": newSize,
                            "settings.isOpen": newSize < grp.settings.maxSize,
                            "groupProfile.avgPHQ9Score": newAvgPHQ9,
                            "groupProfile.avgGAD7Score": newAvgGAD7,
                            "groupProfile.sharedInterests": updatedSharedInterests,
                            "groupProfile.commonLifeTransitions": updatedLifeTransitions
                        }
                    },
                    { session }
                );

                if (!updatedGroup.modifiedCount) {
                    await session.abortTransaction();
                    return res.json({
                        status: false,
                        message: "Failed to update the support group. Please try again."
                    });
                }

                const updatedUser = await UserModel.updateOne(
                    { _id: user._id },
                    { $set: { groupId } },
                    { session }
                );

                if (!updatedUser.modifiedCount) {
                    await session.abortTransaction();
                    return res.json({
                        status: false,
                        message: "Failed to assign you to a group. Please try again later."
                    });
                }
            }
            matchGroupToEvents(groupUpdate)
        }

        await session.commitTransaction();
        const token = generateToken(user._id);
        res.cookie('user_token', token, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict'
        });

        return res.json({ status: true });

    } catch (error) {
        await session.abortTransaction();
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    } finally {
        session.endSession();
    }
};

// User Registration
export const userRegister = async (req, res) => {
    const userDetails = req.body;
    try {
        const existingUser = await UserModel.findOne({ email: userDetails.email });
        if (existingUser) {
            return res.json({
                status: false,
                message: "An account with this email already exists. Please use a different email or log in."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userDetails.password, salt);

        const newUser = await UserModel.create({
            personalInfo: {
                name: userDetails.name,
                dateOfBirth: userDetails.dob,
                gender: userDetails.gender
            },
            email: userDetails.email,
            password: hashedPassword,
            location: {
                type: 'Point',
                coordinates: [
                    userDetails.location.longitude,
                    userDetails.location.latitude
                ],
                city: userDetails.location.city,
                state: userDetails.location.state,
                country: userDetails.location.country,
                place_id: userDetails.location.place_id,
                address: userDetails.location.address
            },
            questionnaire: {
                completed: false
            }
        });

        if (!newUser) {
            return res.json({
                status: false,
                message: "Registration failed. Please try again later."
            });
        }

        const token = generateToken(newUser._id);
        res.cookie('user_token', token, {
            httpOnly: true,
            secure: false,  // set to true in production
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });
        addLog({ eventType: 'user_registered', relatedType: 'user', description: `New user registered. ID: ${newUser._id}` })
        return res.status(201).json({
            status: true,
            message: "User registered successfully."
        });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
};

// Questionnaire Submission
export const questionnaire = async (req, res) => {
    const questionnaireAnswers = req.body;
    if (!questionnaireAnswers) {
        return res.json({
            status: false,
            message: "Questionnaire responses could not be recorded. Please try again."
        });
    }

    if (
        questionnaireAnswers.phq9Total < 0 ||
        questionnaireAnswers.gad7Total < 0
    ) {
        return res.json({
            status: false,
            message: "Invalid questionnaire responses. Please ensure all fields are completed correctly."
        });
    }

    const token = req.cookies.user_token;
    if (!token) {
        return res.json({
            status: false,
            message: "Unauthorized access. Please log in to continue."
        });
    }

    try {
        const decodedToken = verifyToken(token);
        const user = await UserModel.findById(decodedToken.id);
        if (!user) {
            return res.json({
                status: false,
                message: "User not found. Please log in again."
            });
        }
        if (user.questionnaire.completed) {
            return res.json({
                status: true,
                message: "Questionnaire already completed."
            });
        }

        const updateResult = await UserModel.updateOne(
            { _id: decodedToken.id },
            {
                $set: {
                    questionnaire: {
                        completed: true,
                        completedAt: new Date(),
                        phq9Assessment: {
                            totalScore: questionnaireAnswers.phq9Total,
                            category: getPHQ9Category(questionnaireAnswers.phq9Total)
                        },
                        gad7Assessment: {
                            totalScore: questionnaireAnswers.gad7Total,
                            category: getGAD7Category(questionnaireAnswers.gad7Total)
                        },
                        lifeTransitions: {
                            responses: questionnaireAnswers.lifeEvents
                        },
                        interests: {
                            responses: questionnaireAnswers.interests
                        }
                    }
                }
            }
        );

        if (!updateResult) {
            return res.json({
                status: false,
                message: "Unable to save your responses. Please try again."
            });
        }

        return res.json({
            status: true,
            message: "Questionnaire submitted successfully. Please login back"
        });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
};

// Core Function for matching group to suitable events
export const matchGroupToEvents = async (group) => {
    const MATCHING_THRESHOLD = 0.40;
    const MAX_DISTANCE_KM = 50;

    const allEvents = await EventModel.find();

    const phq9Range = PHQ9_SEVERITY_RANGES[group.groupProfile.avgPHQ9Category] || PHQ9_SEVERITY_RANGES['Any'];
    const gad7Range = GAD7_SEVERITY_RANGES[group.groupProfile.avgGAD7Category] || GAD7_SEVERITY_RANGES['Any'];

    const matchedEventIds = [];

    for (const event of allEvents) {
        const weights = EVENT_TYPE_WEIGHTS[event.eventType] || EVENT_TYPE_WEIGHTS['Default'];
        const [groupLon, groupLat] = group.groupProfile.centralCoordinates.coordinates;
        const [eventLon, eventLat] = event.location.coordinates;
        if (!isWithinRange(groupLat, groupLon, eventLat, eventLon, MAX_DISTANCE_KM)) continue;

        const interestScore = jaccardSimilarity(group.groupProfile.sharedInterests, event.targetInterests);
        const transitionScore = jaccardSimilarity(group.groupProfile.commonLifeTransitions, event.targetLifeTransitions);

        const isPhqMatch = event.targetPHQ9Severity >= phq9Range.min && event.targetPHQ9Severity <= phq9Range.max;
        const isGadMatch = event.targetGAD7Severity >= gad7Range.min && event.targetGAD7Severity <= gad7Range.max;
        const clinicalScore = (isPhqMatch || isGadMatch) ? 1 : 0;

        const finalScore = (interestScore * weights.interest) + (transitionScore * weights.transition) + (clinicalScore * weights.clinical);

        if (finalScore >= MATCHING_THRESHOLD) {
            matchedEventIds.push(event._id);
        }
    }

    if (matchedEventIds.length > 0) {
        await GroupModel.updateOne(
            { _id: group._id },
            { $set: { matchedEvents: matchedEventIds } }
        );
    }
};

// Group Matching Helper
export const matchGroup = async (
    phq9Total,
    gad7Total,
    lifeEvents,
    interests,
    coordinates
) => {
    const weights = await WeightModel.findOne();
    const userPHQ9Normalized = phq9Total / weights.TotalPHQ9Score;
    const userGAD7Normalized = gad7Total / weights.TotalGAD7Score;

    const openGroups = await GroupModel.find({ 'settings.isOpen': true });
    const scoredGroups = [];

    for (const currentGroup of openGroups) {
        const [groupLon, groupLat] = currentGroup.groupProfile.centralCoordinates.coordinates;
        if (
            !isWithinRange(
                coordinates[1],
                coordinates[0],
                groupLat,
                groupLon,
                weights.cutoffDistance
            )
        ) {
            continue;
        }

        const groupPHQ9Normalized = currentGroup.groupProfile.avgPHQ9Score / weights.TotalPHQ9Score;
        const groupGAD7Normalized = currentGroup.groupProfile.avgGAD7Score / weights.TotalGAD7Score;

        const phq9Similarity = 1 - Math.abs(userPHQ9Normalized - groupPHQ9Normalized);
        const gad7Similarity = 1 - Math.abs(userGAD7Normalized - groupGAD7Normalized);
        const lifeEventsSimilarity = jaccardSimilarity(
            lifeEvents,
            currentGroup.groupProfile.commonLifeTransitions
        );
        const interestsSimilarity = jaccardSimilarity(
            interests,
            currentGroup.groupProfile.sharedInterests
        );

        const totalSimilarity =
            phq9Similarity * weights.PHQ9Weight +
            gad7Similarity * weights.GAD7Weight +
            lifeEventsSimilarity * weights.LifeEventsWeight +
            interestsSimilarity * weights.InterestsWeight;
        if (totalSimilarity >= weights.matchingThreshold) {
            scoredGroups.push({
                groupId: currentGroup._id,
                similarityScore: Number(totalSimilarity.toFixed(4))
            });
        }
    }

    scoredGroups.sort((a, b) => b.similarityScore - a.similarityScore);
    return scoredGroups.length ? scoredGroups[0].groupId : null;
};

// Logout
export const logoutUser = async (req, res) => {
    const { role } = req.query;
    try {
        if (role === 'User') {
            res.clearCookie('user_token', {
                httpOnly: true,
                secure: true,
                sameSite: 'strict'
            });
            return res.json({ status: true, message: "Logged out." });
        }

        return res.json({
            status: false,
            message: "Invalid role specified."
        });

    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
};

// Authorization Check
export const authorizeUser = async (req, res) => {
    const token = req.cookies.user_token;
    if (!token) {
        return res.json({
            status: false,
            message: "Please log in to continue."
        });
    }

    try {
        const decodedToken = verifyToken(token);
        const user = await UserModel.findById(decodedToken.id);
        if (!user) {
            return res.json({
                status: false,
                message: "Session expired. Please log in again."
            });
        }
        if (!user.questionnaire.completed) {
            return res.json({
                status: false,
                pendingQuestionnaire: true,
                message: "Questionnaire completion is pending."
            })
        };

        if (!user.groupId) {
            return res.json({ status: false, message: 'Please login!' })
        }

        return res.json({ status: true });
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.json({
            status: false,
            message: "Unauthorized access. Please log in."
        });
    }
};

// Doctor Login
export const doctorLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const existingDoctor = await Doctor.findOne({ email });
        if (!existingDoctor || !(await bcrypt.compare(password, existingDoctor.password))) {
            return res.json({
                status: false,
                message: "Invalid credentials. Please check your email and password."
            });
        }

        const token = generateToken(existingDoctor._id);
        return res.status(200).json({
            status: true,
            token
        });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
};

// Doctor Registration
export const doctorRegister = async (req, res) => {
    const {
        name,
        email,
        dob,
        city,
        licenseNumber,
        specialization,
        password
    } = req.body;

    try {
        const existingDoctor = await Doctor.findOne({ email });
        if (existingDoctor) {
            return res.json({
                status: false,
                message: "An account with this email already exists."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newDoctor = await Doctor.create({
            name,
            email,
            dob,
            city,
            licenseNumber,
            specialization,
            password: hashedPassword
        });

        addLog({ eventType: 'doctor_registered', relatedType: 'user', description: `New Doctor registered. ID: ${newDoctor._id}` })

        const token = generateToken(newDoctor._id);
        return res.json({
            status: true,
            doctorId: newDoctor._id,
            token
        });
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
};
