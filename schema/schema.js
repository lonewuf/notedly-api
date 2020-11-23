const { gql } = require('apollo-server-express');

module.exports = gql`
  scalar DateTime

  type Query {
    notes: [Note!]!
    note(id: ID!): Note!
    users: [User!]!
    user(username: String!): User
    me: User!
    noteFeed(cursor: String): NoteFeed
  }

  type Note {
    id: ID!
    content: String!
    author: User!
    createdAt: DateTime!
    updatedAt: DateTime!
    favoriteCount: Int!
    favoritedBy: [User]
  }

  type NoteFeed {
    notes: [Note!]!
    cursor: String!
    hasNextPage: Boolean!
  }

  type User {
    id: ID!
    username: String!
    email: String!
    avatar: String
    notes: [Note!]!
    favorites: [Note!]!
  }

  type Mutation {
    newNote(content: String!): Note!
    updateNote(id: ID!, content: String!): Note!
    deleteNote(id: ID!): Boolean!
    signUp(username: String!, password: String!, email: String!): String!
    signIn(username: String, email: String!, password: String!): String!
    toggleFavorite(id: ID!): Note!
  }
`;
