const { User } = require('../models');
const { signToken } = require('../utils/auth');
const { AuthenticationError } = require('apollo-server-express');

const resolvers = {
    Query: {
        me: async (parent, { username }, context) => {
            // If username is provided, search by username, if not, search by _id
            const params = username ? { username } : {_id: context.user._id};
            // Find one user
            const foundUser =  await User.findOne(params);
            // Throw error if no user is found
            if(!foundUser) {
                throw new AuthenticationError("Cannot find a user with this id!");
            }
            return foundUser 
        }
    },

    Mutation: {
        addUser: async (parent, { username, email, password }) => {
            const user = await User.create({ username, email, password });
            // Create signin token
            const token = signToken(user);
            return { token, user }
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });
            // If there is no user with that email address, return an Authentication error stating so
            if (!user) {
                throw new AuthenticationError("Can't find this user");
            }
            // Using method in User model to verify password
            const correctPw = await user.isCorrectPassword(password);
            if (!correctPw) {
                throw new AuthenticationError('Wrong password!');
            }
            // If password is correct, create signin token
            const token = signToken(user);
            return { token, user }

        },
        // { input } = { authors, description, bookId, image, link, title }
        saveBook: async (parent, { input }, context) => {
            return User.findOneAndUpdate(
                { _id: context.user._id },
                // Add book's info to User
                { $addToSet: { savedBooks: input } },
                // Return updated values and run validators
                { new: true }
              );
        },
        removeBook: async(parent, { bookId }, context ) => {
            const updatedUser = await User.findOneAndUpdate(
                // find User by _id provided by auth
                { _id: context.user._id },
                // Remove book from User by bookId
                { $pull: { savedBooks: { bookId } } },
                // Return updated values
                { new: true }
              );
              if (!updatedUser) {
                throw new AuthenticationError("Couldn't find user with this id!" );
              }
              return updatedUser
        }
    }
}

module.exports = resolvers;