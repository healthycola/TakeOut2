Items = new Mongo.Collection("items");

Items.allow({
    insert: function (userId, item) {
        return userId && item.owner === userId;
    },
    update: function (userId, item, fields, modifier) {
        return userId && (item.owner === userId || (fields.length == 1 && fields[0] === 'threads'));
    },
    remove: function (userId, item) {
        return userId && item.owner === userId;
    }
});

Meteor.methods({
    markAsPickedUp: function (itemId, userId) {
        let item = Items.findOne(itemId);

        if (!item)
            throw new Meteor.Error(404, "No such item!");

        if (item.owner !== this.userId)
            throw new Meteor.Error(404, "No permission!");

        if (Meteor.isServer) {
            if (userId !== item.owner) {
                console.log(userId);
                console.log(this.userId);
                var ownerId = this.userId;
                Items.update({ _id: item._id }, { $set: { "userWhoPickedUp": userId } }, function (err, updateDocs) {
                    if (err) {
                        throw new Meteor.Error(404, "Can't update item");
                    }
                    console.log("doneItemUpdate");
                    Meteor.users.update( { _id: userId } , { $inc: { "profile.itemsPickedUp": 1 }, $push: { "profile.itemsPickedUpList": itemId } }, function (err, updatedDocs) {
                        if (err) {
                            throw new Meteor.Error(404, "Can't update pickup User");
                        }
                        console.log("donePickupUpdate");
                    });
                    Meteor.users.update( { _id: ownerId }, { $inc: { "profile.itemsDonated": 1 } }, function (err, updatedDocs) {
                        if (err) {
                            throw new Meteor.Error(404, "Can't update donated user");
                        }
                        console.log("doneDonatedUpdate");
                    });
                });
            }
        }
    }
});