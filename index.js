require('dotenv').config();
const express = require('express');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const cors = require('cors');

const { ApolloServer } = require('apollo-server-express');
const depthLimit = require('graphql-depth-limit');
const { createComplexityLimitRule } = require('graphql-validation-complexity');

const db = require('./db/db');
const models = require('./models');
const keys = require('./config/keys');

const PORT = process.env.PORT || 4000;
const HOST = process.env.HOST || '0.0.0.0';

const typeDefs = require('./schema/schema');
const resolvers = require('./resolvers');

const getUser = async token => {
  if (token) {
    try {
      return jwt.verify(token, keys.jwtSecret);
    } catch (err) {
      throw new Error('Session Invalid');
    }
  }
};

const app = express();
app.use(helmet());
app.use(cors());
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: async ({ req }) => {
    const token = req.headers.authorization;
    const user = await getUser(token);
    return { models, user };
  }
});

db.connect(keys.mongoURI);
server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => {
  res.send('hello');
});

app.listen(PORT, HOST, () =>
  console.log(
    `GraphQL Server is running at http://${HOST}:${PORT}${server.graphqlPath}`
  )
);
