Threads = new Mongo.Collection("threads");

Threads.allow({
  insert: function (userId, thread) {
    return userId;
  },
  update: function (userId, thread, fields, modifier) {
    return userId && (thread.ownerId === userId || thread.user === userId);
  },
  remove: function (userId, thread) {
    return userId && (thread.ownerId === userId || thread.user === userId);
  }
});