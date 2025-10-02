import EventModel from "../models/EventModel"
import GroupModel from "../models/GroupModel"
import { EVENT_TYPE_WEIGHTS, GAD7_SEVERITY_RANGES, PHQ9_SEVERITY_RANGES } from "../utils/Constants"
import { isWithinRange, jaccardSimilarity } from "../utils/helperFunctions"

export const HostEvent = async (req, res) => {
    const eventDetails = req.body
    if (!eventDetails) return res.json({ status: false, message: "Something went Wrong!" })
    const { title, description, eventDate, eventType, location, capacity, targetInterests, targetLifeTransitions, targetPHQ9Severity, targetGAD7Severity } = eventDetails
    try {
        const addEvent = new EventModel({
            title: title,
            description: description,
            startDateTime: new Date(eventDate),
            eventType: eventType,
            capacity: capacity,
            targetInterests: targetInterests,
            targetLifeTransitions: targetLifeTransitions,
            targetPHQ9Severity: targetPHQ9Severity,
            targetGAD7Severity: targetGAD7Severity,
            address: location.formatted,
            placeId: location.place_id,
            location: {
                coordinates: [location.lon, location.lat]
            },
        })
        await addEvent.save()
        const groupIds = await matchEventToGroups(addEvent)
        const eventId = addEvent._id
        return res.json({ status: true, message: "Event Created!", groupIds, eventId })

    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

const PAGE_LIMIT = 8;
export const FetchEvents = async (req, res) => {
    const getEvents = req.query.status
    try {
        let filter = null;
        const page = req.query.page
        const skip = (page - 1) * PAGE_LIMIT

        if (getEvents === "upcoming") {
            filter = { startDateTime: { $gte: new Date() } }
        } else {
            filter = { startDateTime: { $lt: new Date() } }
        }
        const results = await EventModel.find(filter).skip(skip).limit(PAGE_LIMIT + 1).sort({ startDateTime: -1 }).lean()
        const hasMore = results.length > PAGE_LIMIT
        const events = hasMore ? results.slice(0, PAGE_LIMIT) : results

        return res.json({ status: true, events, hasMore })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

// Core Function
export const matchEventToGroups = async (event) => {
    const MATCHING_THRESHOLD = 0.40;
    const MAX_DISTANCE_KM = 50;
    const allGroups = await GroupModel.find();
    const weights = EVENT_TYPE_WEIGHTS[event.eventType] || EVENT_TYPE_WEIGHTS['Default'];
    const phq9Range = PHQ9_SEVERITY_RANGES[event.targetPHQ9Severity] || PHQ9_SEVERITY_RANGES['Any'];
    const gad7Range = GAD7_SEVERITY_RANGES[event.targetGAD7Severity] || GAD7_SEVERITY_RANGES['Any'];
    const matchedGroupIds = [];

    for (const group of allGroups) {
        const [groupLon, groupLat] = group.groupProfile.centralCoordinates.coordinates;
        const [eventLon, eventLat] = event.location.coordinates;
        if (!isWithinRange(eventLat, eventLon, groupLat, groupLon, MAX_DISTANCE_KM)) continue;

        const interestScore = jaccardSimilarity(event.targetInterests, group.groupProfile.sharedInterests);
        const transitionScore = jaccardSimilarity(event.targetLifeTransitions, group.groupProfile.commonLifeTransitions);

        const isPhqMatch = group.groupProfile.avgPHQ9Score >= phq9Range.min && group.groupProfile.avgPHQ9Score <= phq9Range.max;
        const isGadMatch = group.groupProfile.avgGAD7Score >= gad7Range.min && group.groupProfile.avgGAD7Score <= gad7Range.max;
        const clinicalScore = (isPhqMatch || isGadMatch) ? 1 : 0;

        const finalScore = (interestScore * weights.interest) + (transitionScore * weights.transition) + (clinicalScore * weights.clinical);

        if (finalScore >= MATCHING_THRESHOLD) {
            matchedGroupIds.push(group._id);
        }
    }

    if (matchedGroupIds.length > 0) {
        await GroupModel.updateMany(
            { _id: { $in: matchedGroupIds } },
            { $push: { matchedEvents: event._id } }
        );
    }

    return matchedGroupIds;
};