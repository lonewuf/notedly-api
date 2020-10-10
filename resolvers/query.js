module.exports = {
  notes: async (parents, args, { models }) =>
    await models.Note.find().limit(100),
  note: async (parent, args, { models }) => await models.Note.findById(args.id),
  users: async (parents, args, { models }) => await models.User.find(),
  user: async (parents, { username }, { models }) =>
    await models.User.findOne({ username }),
  me: async (parents, args, { models, user }) =>
    await models.User.findById(user.id),
  noteFeed: async (parent, { cursor }, { models }) => {
    const limit = 10;
    let hasNextPage = false;

    let cursorQuery = {};

    if (cursor) {
      cursorQuery = { _id: { $lt: cursor } };
    }

    let notes = await models.Note.find(cursorQuery)
      .sort({ _id: -1 })
      .limit(limit + 1);

    if (notes.length > limit) {
      hasNextPage = true;
      notes = notes.slice(0, -1);
    }

    const newCursor = notes[notes.length - 1]._id;

    return {
      notes,
      cursor: newCursor,
      hasNextPage
    };
  }
};
