Testimonials = new Mongo.Collection("testimonials");

Testimonials.allow({
    insert: function (userId, testimonial) {
        return userId && (testimonial.ownerId !== userId) ;
    },
    update: function (userId, testimonial, fields, modifier) {
        return userId && testimonial.ownerId !== userId && testimonial.user === userId;
    },
    remove: function (userId, thread) {
        return false;
    }
});