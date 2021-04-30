import mongoose from 'mongoose';

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

const singleGroup = (userID: string): unknown[] => [
  {
    $match: {
      _id: mongoose.Types.ObjectId(userID),
    },
  },
  ...counter,
];

const groupList = (userId: string): unknown[] => [
  {
    $match: {
      _id: mongoose.Types.ObjectId(userId),
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

export { groupList, counter, singleGroup };
