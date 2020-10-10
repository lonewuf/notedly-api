module.exports = {
  author: async (note, args, { models }) =>
    await models.User.findById(note.author),
  favoritedBy: async (note, args, { models }) =>
    await models.User.find({ _id: { $in: note.favoritedBy } })
};
