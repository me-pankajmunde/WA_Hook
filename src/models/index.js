const User = require('./User');
const Session = require('./Session');
const Message = require('./Message');
const Media = require('./Media');
const Artifact = require('./Artifact');

// Define associations
User.hasMany(Session, { foreignKey: 'userId', as: 'sessions' });
Session.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Message, { foreignKey: 'userId', as: 'messages' });
Message.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Session.hasMany(Message, { foreignKey: 'sessionId', as: 'messages' });
Message.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });

Message.hasMany(Media, { foreignKey: 'messageId', as: 'media' });
Media.belongsTo(Message, { foreignKey: 'messageId', as: 'message' });

User.hasMany(Media, { foreignKey: 'userId', as: 'media' });
Media.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Session.hasMany(Media, { foreignKey: 'sessionId', as: 'media' });
Media.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });

User.hasMany(Artifact, { foreignKey: 'userId', as: 'artifacts' });
Artifact.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Session.hasMany(Artifact, { foreignKey: 'sessionId', as: 'artifacts' });
Artifact.belongsTo(Session, { foreignKey: 'sessionId', as: 'session' });

module.exports = {
  User,
  Session,
  Message,
  Media,
  Artifact
};
