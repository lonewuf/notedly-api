require('dotenv').config();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const {
  AuthenticationError,
  ForbiddenError
} = require('apollo-server-express');
const gravatar = require('../util/gravatar');
const keys = require('../config/keys');

module.exports = {
  newNote: async (parent, { content }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You need to signed in to create a note');
    }
    return await models.Note.create({
      content: content,
      author: mongoose.Types.ObjectId(user.id)
    });
  },
  updateNote: async (parent, { id, content }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You need to signed in to update a note');
    }
    const note = await models.Note.findById(id);

    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permission to update the note");
    }

    return await models.Note.findOneAndUpdate(
      {
        _id: id
      },
      {
        $set: { content }
      },
      {
        new: true
      }
    );
  },
  deleteNote: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError('You must be signed in to delete a note');
    }

    const note = await models.Note.findById(id);
    if (note && String(note.author) !== user.id) {
      throw new ForbiddenError("You don't have permission to delete the note");
    }

    try {
      await note.remove();
      return true;
    } catch (err) {
      console.log(err);
      return false;
    }
  },
  signUp: async (parent, { username, password, email }, { models }) => {
    email = email.trim().toLowerCase();
    const hashed = await bcrypt.hash(password, 10);
    const avatar = gravatar(email);
    try {
      const user = await models.User.create({
        username,
        email,
        password: hashed,
        avatar
      });
      return jwt.sign({ id: user._id }, keys.jwtSecret);
    } catch (err) {
      throw new Error('Error creating account');
    }
  },
  signIn: async (parent, { username, password, email }, { models }) => {
    if (email) {
      email = email.trim().toLowerCase();
    }

    const user = await models.User.findOne({ $or: [{ email }, { username }] });
    if (!user) {
      throw new AuthenticationError('Error Signing in');
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new AuthenticationError('Error Signing in');
    }

    return jwt.sign({ id: user._id }, keys.jwtSecret);
  },
  toggleFavorite: async (parent, { id }, { models, user }) => {
    if (!user) {
      throw new AuthenticationError();
    }

    let noteCheck = await models.Note.findById(id);
    const hasUser = noteCheck.favoritedBy.indexOf(user.id);

    if (hasUser >= 0) {
      return models.Note.findByIdAndUpdate(
        id,
        {
          $pull: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: -1
          }
        },
        {
          new: true
        }
      );
    } else {
      return models.Note.findByIdAndUpdate(
        id,
        {
          $push: {
            favoritedBy: mongoose.Types.ObjectId(user.id)
          },
          $inc: {
            favoriteCount: 1
          }
        },
        {
          new: true
        }
      );
    }
  }
};
