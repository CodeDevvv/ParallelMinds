import ChatModel from "../models/ChatModel";
import GroupModel from "../models/GroupModel";
import UserModel from "../models/UserModel";

import { decryptMessage } from "../utils/EncryptDecrypt";
import { verifyToken } from "../utils/generateToken";

export const chatHistory = async (req, res) => {
    const token = req.cookies.user_token;
    try {
        const decodedToken = verifyToken(token)
        const userGroup = await UserModel.findById(decodedToken.id).lean()
        if (!userGroup) return res.json({ status: false, message: "Something went wrong!" })
        const chats = await ChatModel.find({ groupId: userGroup.groupId }).sort({ timestamp: 1 }).lean()
        chats.forEach((chat) => {
            const decryptedText = decryptMessage(chat.message);
            chat.message = decryptedText;
        });
        const groupDetails = await GroupModel.findOne({ _id: userGroup.groupId }).lean()
        const members = [];
        const groupInfo = {}
        for (const memberId of groupDetails.membersId) {
            const username = await UserModel.findById(memberId)
                .select('personalInfo.name')
                .lean();
            members.push({ name: username.personalInfo.name, _id: username._id });
        }
        groupInfo["members"] = members
        groupInfo["memberCount"] = members.length
        groupInfo["joinedDate"] = userGroup.questionnaire.completedAt
        groupInfo["eventsMatched"] = groupDetails.matchedEvents.length
        groupInfo["sharedInterests"] = groupDetails.groupProfile.sharedInterests
        return res.json({ status: true, chatHistory: chats, groupInfo: groupInfo })
    } catch (error) {
        console.log(error)
        return res.json({ status: false, message: "Internal server error. Please refresh the page or try again later." })
    }
} 