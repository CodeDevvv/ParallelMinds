import bcrypt from 'bcryptjs';

import { generateToken, getUserIdFromToken } from '../utils/generateToken.js';
import { getGAD7Category, getPHQ9Category } from '../utils/helperFunctions.js';

import pool, { query } from '../config/db.js';
import Doctor from '../models/DoctorModel.js';
import { matchGroupSQL } from '../services/matching.js';
import { addSystemLog } from './logController.js';

// User Login 
export const userLogin = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        console.log(`[Auth] Login attempt failed: Missing credentials for ${email || 'unknown'}`);
        return res.status(400).json({ status: false, message: "Email and password are required." });
    }

    const client = await pool.connect();

    try {
        const userRes = await client.query(`
            SELECT id, email, password_hash, group_id, is_questionnaire_completed,
                   phq_score, gad_score, interests, life_transitions,
                   ST_AsGeoJSON(location)::jsonb AS location 
            FROM users 
            WHERE email = $1`, 
            [email]
        );

        const user = userRes.rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash))) {
            console.log(`[Auth] Unauthorized access attempt: ${email}`);
            return res.status(401).json({ status: false, message: "Invalid email or password." });
        }

        await client.query('BEGIN');

        if (!user.group_id && user.is_questionnaire_completed) {
            console.log(`[Matching] Initiating group placement for User ID: ${user.id}`);
            
            let matchedGroupId = await matchGroupSQL(user, client);

            if (!matchedGroupId) {
                console.log(`[Matching] No suitable group found. Provisioning new group.`);
                
                const [lon, lat] = user.location.coordinates;
                const newGroupRes = await client.query(`
                    INSERT INTO groups (
                        centroid, avg_phq_score, avg_gad_score, 
                        common_life_transitions, shared_interests, 
                        current_size, is_open
                    ) VALUES (
                        ST_SetSRID(ST_MakePoint($1, $2), 4326), 
                        $3, $4, $5, $6, 1, true
                    ) RETURNING id`, 
                    [lon, lat, user.phq_score, user.gad_score, user.life_transitions, user.interests]
                );
                
                matchedGroupId = newGroupRes.rows[0].id;

            } else {
                const groupUpdateRes = await client.query(`
                    UPDATE groups
                    SET
                        avg_phq_score = ((avg_phq_score * current_size) + $1) / (current_size + 1),
                        avg_gad_score = ((avg_gad_score * current_size) + $2) / (current_size + 1),
                        shared_interests = ARRAY(SELECT DISTINCT UNNEST(array_cat(shared_interests, $3))),
                        common_life_transitions = ARRAY(SELECT DISTINCT UNNEST(array_cat(common_life_transitions, $4))),
                        is_open = (current_size + 1) < max_size,
                        current_size = current_size + 1
                    WHERE id = $5 AND current_size < max_size AND is_open = true
                    RETURNING id`, 
                    [user.phq_score, user.gad_score, user.interests, user.life_transitions, matchedGroupId]
                );

                if (groupUpdateRes.rowCount === 0) {
                    await client.query('ROLLBACK');
                    console.log(`[Matching] Conflict: Group ${matchedGroupId} filled during processing.`);
                    return res.status(409).json({
                        status: false,
                        message: "The selected group is full. Please re-authenticate to retry matching."
                    });
                }
            }

            await client.query(`UPDATE users SET group_id = $1 WHERE id = $2`, [matchedGroupId, user.id]);
            console.log(`[Matching] User ${user.id} successfully assigned to Group ${matchedGroupId}`);
        }

        await client.query('COMMIT');

        const token = generateToken(user.id);
        res.cookie('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        console.log(`[Auth] User ${user.id} logged in successfully.`);
        return res.json({ status: true });

    } catch (error) {
        if (client) await client.query('ROLLBACK');
        console.error(`[Critical] Transaction failed for ${email}:`, error.message);
        return res.status(500).json({ status: false, message: "Internal server error." });
    } finally {
        client.release();
    }
};

export const userRegister = async (req, res) => {
    try {
        const userDetails = req.body;

        const userRes = await pool.query(`SELECT email FROM users WHERE email = $1`, [userDetails.email]);
        
        if (userRes.rowCount > 0) {
            console.log(`[Auth] Registration conflict: Email already exists: ${userDetails.email}`);
            return res.status(409).json({
                status: false,
                message: "An account with this email already exists. Please use a different email or log in."
            });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(userDetails.password, salt);

        const userInsertQuery = `
            INSERT INTO users (
                email, 
                password_hash, 
                full_name, 
                date_of_birth, 
                gender, 
                location,  
                city, 
                state, 
                country, 
                place_id, 
                address 
            ) VALUES (
                $1, $2, $3, $4, $5, 
                ST_SetSRID(ST_MakePoint($6, $7), 4326), 
                $8, $9, $10, $11, $12
            )
            RETURNING id;
        `;

        const newUserRes = await pool.query(userInsertQuery, [
            userDetails.email,
            hashedPassword,
            userDetails.name,
            userDetails.dob,
            userDetails.gender,
            userDetails.location?.longitude,
            userDetails.location?.latitude,
            userDetails.location?.city,
            userDetails.location?.state,
            userDetails.location?.country,
            userDetails.location?.place_id,
            userDetails.location?.address
        ]);

        const id = newUserRes.rows[0]?.id;

        if (!id) {
            console.log(`[Auth] Registration failed: Database did not return an ID for ${userDetails.email}`);
            return res.status(500).json({
                status: false,
                message: "Registration failed. Please try again later."
            });
        }

        await addSystemLog({
            eventType: 'user_registered',
            relatedType: 'user',
            description: `New user account created for ${userDetails.email} with ID: ${id}`
        });

        const token = generateToken(id);
        res.cookie('user_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000
        });

        console.log(`[Auth] Success: New user created with ID: ${id}`);
        return res.status(201).json({
            status: true,
            message: "User registered successfully."
        });

    } catch (error) {
        console.error(`[Critical] Registration error:`, error.message);
        return res.status(500).json({
            status: false,
            message: "Internal server error. Please refresh the page or try again later."
        });
    }
};

// Questionnaire Submission
export const questionnaire = async (req, res) => {
    try {
        console.log("[Assessment] Received questionnaire submission attempt.");
        const questionnaireAnswers = req.body;

        if (!questionnaireAnswers || questionnaireAnswers.phq9Total < 0 || questionnaireAnswers.gad7Total < 0) {
            console.log("[Assessment] Validation failed: Negative or missing scores.");
            return res.status(400).json({
                status: false,
                message: "Invalid questionnaire responses. Please ensure all fields are completed correctly."
            });
        }

        const token = req.cookies.user_token;
        if (!token) {
            console.log("[Assessment] Unauthorized: No token found in cookies.");
            return res.status(401).json({ status: false, message: "Unauthorized access. Please log in to continue." }); 
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Assessment] Unauthorized: Token verification failed.");
            return res.status(401).json({ status: false, message: "Unauthorized access. Please log in to continue." });
        }

        const userRes = await query(`SELECT id, is_questionnaire_completed FROM users WHERE id = $1`, [userId]);
        
        if (userRes.rowCount === 0) {
            console.log(`[Assessment] Sync error: User ID ${userId} not found.`);
            return res.status(404).json({ status: false, message: "User not found. Please log in again." });
        }

        if (userRes.rows[0].is_questionnaire_completed) {
            console.log(`[Assessment] Redundant submission: User ${userId} already completed questionnaire.`);
            return res.status(200).json({ status: true, message: "Questionnaire already completed." });
        }

        const questionaireUpdateQuery = `
            UPDATE users 
            SET
                phq_score = $1, 
                phq_category = $2,
                gad_score = $3, 
                gad_category = $4,
                life_transitions = $5,
                interests = $6,
                is_questionnaire_completed = $7,
                completed_at = $8
            WHERE 
                id = $9
            RETURNING id
        `;

        const updateQuestionaireRes = await query(questionaireUpdateQuery, [
            questionnaireAnswers.phq9Total, getPHQ9Category(questionnaireAnswers.phq9Total),
            questionnaireAnswers.gad7Total, getGAD7Category(questionnaireAnswers.gad7Total),
            questionnaireAnswers.lifeEvents, questionnaireAnswers.interests,
            true, new Date(), userId
        ]);

        if (updateQuestionaireRes.rowCount === 0) {
            console.log(`[Assessment] Database failure: Update failed for User ${userId}.`);
            return res.status(500).json({
                status: false,
                message: "Unable to save your responses. Please try again."
            });
        }

        console.log(`[Assessment] Success: Questionnaire stored for User ${userId}.`);
        return res.json({ status: true, message: "Questionnaire submitted successfully. Please login back to find your group." });

    } catch (error) {
        console.error(`[Critical] Questionnaire error:`, error.message);
        return res.status(500).json({ status: false, message: "Internal server error. Please refresh the page or try again later." });
    } finally {
        console.log("[Assessment] Request lifecycle finished.");
    }
};

// // Core Function for matching group to suitable events
// export const matchGroupToEvents = async (group) => {
//     const MATCHING_THRESHOLD = 0.40;
//     const MAX_DISTANCE_KM = 50;

//     const allEvents = await EventModel.find();

//     const phq9Range = PHQ9_SEVERITY_RANGES[group.groupProfile.avgPHQ9Category] || PHQ9_SEVERITY_RANGES['Any'];
//     const gad7Range = GAD7_SEVERITY_RANGES[group.groupProfile.avgGAD7Category] || GAD7_SEVERITY_RANGES['Any'];

//     const matchedEventIds = [];

//     for (const event of allEvents) {
//         const weights = EVENT_TYPE_WEIGHTS[event.eventType] || EVENT_TYPE_WEIGHTS['Default'];
//         const [groupLon, groupLat] = group.groupProfile.centralCoordinates.coordinates;
//         const [eventLon, eventLat] = event.location.coordinates;
//         if (!isWithinRange(groupLat, groupLon, eventLat, eventLon, MAX_DISTANCE_KM)) continue;

//         const interestScore = jaccardSimilarity(group.groupProfile.sharedInterests, event.targetInterests);
//         const transitionScore = jaccardSimilarity(group.groupProfile.commonLifeTransitions, event.targetLifeTransitions);

//         const isPhqMatch = event.targetPHQ9Severity >= phq9Range.min && event.targetPHQ9Severity <= phq9Range.max;
//         const isGadMatch = event.targetGAD7Severity >= gad7Range.min && event.targetGAD7Severity <= gad7Range.max;
//         const clinicalScore = (isPhqMatch || isGadMatch) ? 1 : 0;

//         const finalScore = (interestScore * weights.interest) + (transitionScore * weights.transition) + (clinicalScore * weights.clinical);

//         if (finalScore >= MATCHING_THRESHOLD) {
//             matchedEventIds.push(event._id);
//         }
//     }

//     if (matchedEventIds.length > 0) {
//         await GroupModel.updateOne(
//             { _id: group._id },
//             { $set: { matchedEvents: matchedEventIds } }
//         );
//     }
// };

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
    try {
        const token = req.cookies.user_token;

        if (!token) {
            console.log("[Auth] Authorization failed: No token provided.");
            return res.status(401).json({ status: false, message: "Please log in to continue." });
        }

        const userId = getUserIdFromToken(token);
        if (!userId) {
            console.log("[Auth] Authorization failed: Token decode returned no User ID.");
            return res.status(401).json({ status: false, message: "Invalid session." });
        }

        const userRes = await query(
            `SELECT id, is_questionnaire_completed, group_id FROM users WHERE id = $1`, 
            [userId]
        );

        if (userRes.rowCount === 0) {
            console.log(`[Auth] Session sync failed: User ${userId} not found in database.`);
            return res.status(404).json({ status: false, message: "Session expired. Please log in again." });
        }

        const user = userRes.rows[0];

        if (!user.is_questionnaire_completed) {
            console.log(`[Auth] Access restricted: User ${userId} has not completed questionnaire.`);
            return res.json({ 
                status: false, 
                pendingQuestionnaire: true, 
                message: "Questionnaire completion is pending." 
            });
        }

        if (!user.group_id) {
            console.log(`[Auth] Access restricted: User ${userId} is not assigned to a group.`);
            return res.json({ 
                status: false, 
                message: "Account setup incomplete. Please log in again to be matched with a group." 
            });
        }

        console.log(`[Auth] Access granted for User ID: ${userId}`);
        return res.json({ status: true });

    } catch (error) {
        console.error(`[Critical] Authorization error:`, error.message);
        return res.status(500).json({ status: false, message: "Unauthorized access. Please log in." });
    }
};


// TODO
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

        addSystemLog({ eventType: 'doctor_registered', relatedType: 'user', description: `New Doctor registered. ID: ${newDoctor._id}` })

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
