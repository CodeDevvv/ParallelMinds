import bcrypt from "bcrypt"
import { generateToken } from "../utils/generateToken"
import UserModel from "../models/UserModel"
import DoctorModel from "../models/DoctorModel"
import QueryModel from "../models/QueryModel"
import LogModel from "../models/LogModel"
import AdminModel from "../models/AdminAuthModel"
import EventModel from "../models/EventModel"
import FeedbackModel from "../models/FeedbackModel"
import GroupModel from "../models/GroupModel"
import ChatModel from "../models/ChatModel"
import { decryptMessage } from "../utils/EncryptDecrypt"
import mongoose from "mongoose"

// Authentication
export const Auth = async (req, res) => {
    const formData = req.body
    try {
        const admin = await AdminModel.findOne({ email: formData.email }).lean()
        if (!admin) return res.json({ status: false, message: "Admin Not Found!" })

        const matchpassword = await bcrypt.compare(formData.password, admin.password)
        if (!matchpassword) return res.json({ status: false, message: "Invalid Credentials !" })
        const adminData = {
            email: admin.email,
            name: admin.name,
            id: admin._id
        }
        return res.json({ status: true, message: "Log in , Successfull!", adminData, token: generateToken(admin._id) })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

// Fetch Data
export const FetchUsers = async (req, res) => {
    const role = req.query.role
    try {
        const modelsMap = {
            users: UserModel,
            doctors: DoctorModel,
            admins: AdminModel,
        };
        const model = modelsMap[role];
        if (!model) {
            return res.json({ status: false, message: "Invalid role" });
        }

        const sortOrder = req.query.sort === 'new' ? -1 : 1
        const page = Number(req.query.page)
        const PAGE_LIMIT = 8
        const skip = (page - 1) * PAGE_LIMIT
        let filters = {}
        if (role === 'users') {
            const search = req.query.search
            const searchType = req.query.searchType

            if (search) {
                filters[searchType] = {$regex : new RegExp(search, 'i')};
            }
            // search 
            // } else if (role === 'doctor') {

        } else {
            filters = {}
        }
        const results = await model.find(filters).skip(skip).limit(PAGE_LIMIT + 1).sort({ createdAt: sortOrder , _id: sortOrder }).lean()
        const hasMore = results.length > PAGE_LIMIT
        const data = hasMore ? results.slice(0, PAGE_LIMIT) : results
        return res.json({ status: true, data, hasMore })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const FetchCounts = async (req, res) => {
    try {
        const userCount = await UserModel.countDocuments({})
        const doctorsCount = await DoctorModel.countDocuments({})
        const ongoingEvents = await EventModel.countDocuments({ startDateTime: { $gt: new Date() } })
        const completedEvents = await EventModel.countDocuments({ startDateTime: { $lt: new Date() } })

        const stats = { users: userCount, doctors: doctorsCount, ongoing: ongoingEvents, completed: completedEvents }

        return res.json({ status: true, stats: stats })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const FetchQueries = async (req, res) => {
    const status = req.query.status
    const page = req.query.page
    const PAGE_LIMIT = 7
    const skip = (page - 1) * PAGE_LIMIT;
    try {

        const queries = await QueryModel.find({ status: status })
            .skip(skip)
            .limit(PAGE_LIMIT + 1)
            .sort({ submittedAt: -1 })
            .lean()

        const hasMore = queries.length > PAGE_LIMIT
        const results = hasMore ? queries.slice(0, PAGE_LIMIT) : queries
        return res.json({ status: true, data: results, hasMore })

    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const FetchLogs = async (req, res) => {
    try {
        const logs = await LogModel.find({}).sort({ createdAt: -1 })
        return res.json({ logs })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}


export const FetchEventFeedbacks = async (req, res) => {
    const id = req.query.eventId
    try {
        const feedbacks = await FeedbackModel.find({ event: id }).sort({ createdAt: -1 }).lean()
        return res.json({ feedbacks })
    } catch (error) {
        console.log(error)
        return res.json({ feedback: [] })
    }
}

export const FetchGroups = async (req, res) => {
    const page = req.query.page
    const sortOrder = req.query.sortOrder === 'newest' ? -1 : 1
    const filters = {}
    const status = req.query.status
    const searchQuery = req.query.searchQuery
    if(status && status != "all") {
        filters["settings.isOpen"] = status === 'open' ? true : false
    }
    // if(searchQuery) {
    //     filters["_id"] = {$regex : new RegExp(searchQuery, "i")}
    // }
    const PAGE_LIMIT = 6
    const skip = (page - 1) * PAGE_LIMIT
    try {
        const results = await GroupModel.find(filters).sort({ createdAt: sortOrder, _id: sortOrder }).skip(skip).limit(PAGE_LIMIT + 1).lean()
        const hasMore = results.length > PAGE_LIMIT
        const groups = hasMore ? results.slice(0, PAGE_LIMIT) : results
        return res.json({ status: true, groups, hasMore })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const FetchChats = async (req, res) => {
    const groupId = req.query.groupId
    try {
        const chats = await ChatModel.find({ groupId: groupId }).sort({ timestamp: 1 }).lean()
        chats.forEach((chat) => {
            const decryptedText = decryptMessage(chat.message);
            chat.message = decryptedText;
        });
        return res.json({ status: true, chats })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const SubmitQueryResponse = async (req, res) => {
    const response = req.body
    try {
        const submitResponse = await QueryModel.updateOne({ _id: response.queryId }, { $set: { response: response.responseText, respondedAt: new Date(), status: 'Closed' } })
        if (submitResponse) {
            return res.json({ status: true, message: "Response submitted" })
        }
        return res.json({ status: false, message: "Response failed to submit" })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
}

export const DeleteAccount = async (req, res) => {
    const role = req.query.role
    const id = req.query.id
    const session = await mongoose.startSession()
    try {
        let deleteAccount;
        if (role === 'user') {
            session.startTransaction()
            await EventModel.deleteMany({ "attendees.users": { $in: [id] }, startDateTime: { $gt: new Date() } }, { session })
            await GroupModel.deleteOne({ membersId: { $in: [id] } }, { session })
            deleteAccount = await UserModel.deleteOne({ _id: id }, { session })
        } else if (role === 'admin') {
            deleteAccount = await AdminModel.deleteOne({ _id: id }, { session })
        }

        if (deleteAccount.deletedCount === 0) {
            return res.json({ status: false, message: "Failed to delete User." })
        }
        await LogModel.create(
            {
                eventType: 'delete_account',
                description: `${id} - Account deleted by admin`,
                relatedType: 'user'
            })
        await session.commitTransaction()
        return res.json({ status: true })
    } catch (error) {
        if (session.inTransaction()) {
            await session.abortTransaction();
        }
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    } finally {
        session.endSession();
    }
}
