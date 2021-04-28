"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleGroup = exports.counter = exports.groupList = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const counter = [
    {
        $lookup: {
            from: 'users',
            let: {
                id: '$_id',
            },
            pipeline: [
                {
                    $match: {
                        $expr: {
                            $in: [
                                '$$id', '$groups',
                            ],
                        },
                    },
                },
            ],
            as: 'memberCount',
        },
    }, {
        $addFields: {
            memberCount: {
                $size: '$memberCount',
            },
        },
    },
];
exports.counter = counter;
const singleGroup = userID => [
    {
        $match: {
            _id: mongoose_1.default.Types.ObjectId(userID),
        },
    },
    ...counter,
];
exports.singleGroup = singleGroup;
const groupList = (userId) => [
    {
        $match: {
            _id: mongoose_1.default.Types.ObjectId(userId),
        },
    },
    {
        $lookup: {
            from: 'groups',
            localField: 'groups',
            foreignField: '_id',
            as: 'groups',
        },
    },
    {
        $project: {
            group: '$groups',
        },
    },
    {
        $unwind: {
            path: '$group',
        },
    },
    {
        $replaceRoot: {
            newRoot: '$group',
        },
    },
    ...counter,
];
exports.groupList = groupList;
