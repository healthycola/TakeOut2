Items = new Mongo.Collection("items");

Items.allow({
  insert: function (userId, item) {
    return userId && item.owner === userId;
  },
  update: function (userId, item, fields, modifier) {
    return userId && item.owner === userId;
  },
  remove: function (userId, item) {
    return userId && item.owner === userId;
  }
});