const express = require('express');
// Import Apollo Server
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const db = require('./config/connection');
// Import Auth
const { authMiddleware } = require('./utils/auth');
// Import schemas
const { typeDefs, resolvers } = require('./schemas');

const app = express();
const PORT = process.env.PORT || 3001;
// Initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: authMiddleware,
});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// if we're in production, serve client/build as static assets
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/build')));
}
// Render front end
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/build/index.html'));
});


// Create a new instance of an Apollo server with the GraphQL schema
const startApolloServer = async () => {
  await server.start();
  server.applyMiddleware({ app });
  
  db.once('open', () => {
    app.listen(PORT, () => {
      console.log(`API server running on port ${PORT}!`);
      console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
    })
  })
  };
  
// Start server
  startApolloServer();
