angular.module('takeout', [
    'angular-meteor',
    'ui.router',
    'angular-meteor.auth',
    'angularMoment',
    'rgkevin.datetimeRangePicker',
    'ui.bootstrap',
    'ngFileUpload',
    'ngAnimate'
]);

angular
.module('takeout')
.filter('range', function() {
    return function(input, total) {
        total = parseInt(total, 10);

        for(var i=0; i<total; ++i) {
            input.push(i);
        }
    
        return input;
    };
});

angular.module('takeout').directive('home', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/pages/home.html',
        controllerAs: 'home',
        controller: function ($scope, $reactive) {
            $reactive(this).attach($scope);
        }
    }
});

angular.module('takeout').directive('navbar', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/layout/navbar.html',
        controllerAs: 'navbar',
        controller: function ($scope, $reactive) {
            $reactive(this).attach($scope);
            
            this.helpers({
                notifications: () => {
                    return Threads.find({ $or: [ 
                        { $and: [ { "readByUser" : false }, { user: Meteor.user()._id } ] }, 
                        { $and: [ { "readByOwner": false }, { ownerId: Meteor.user()._id } ] } 
                        ]}).count();
                }
            });
        }
    }
});

angular.module('takeout').directive('navbar2', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/layout/navbar2.html',
        controllerAs: 'navbar2',
        controller: function ($scope, $reactive) {
            $reactive(this).attach($scope);
            this.helpers({
                notifications: () => {
                    return Threads.find({ $or: [ 
                        { $and: [ { "readByUser" : false }, { user: Meteor.user()._id } ] }, 
                        { $and: [ { "readByOwner": false }, { ownerId: Meteor.user()._id } ] } 
                        ]}).count();
                }
            });
        }
    }
});

angular.module('takeout').directive('footer', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/layout/footer.html',
        controllerAs: 'footer',
        controller: function ($scope, $reactive) {
            $reactive(this).attach($scope);
        }
    }
});

angular.module('takeout').directive('signup', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/pages/signup.html',
        controllerAs: 'signup',
        controller: function ($scope, $reactive, $meteor, $state) {
            $reactive(this).attach($scope);

            this.newUser = {};

            this.addUser = () => {
                Accounts.createUser({
                    password: this.newUser.signuppassword,
                    email: this.newUser.signupEmail,
                    profile: {
                        firstName: this.newUser.signupFirstName,
                        lastName: this.newUser.signupLastName,
                        email: this.newUser.signupEmail,
                        accountType: this.newUser.accountType,
                        itemsDonated: 0,
                        itemsPickedUp: 0,
                        signupDate: new Date()
                    }
                }, function (error) {
                    if (error) {
                        // Display the user creation error to the user however you want
                        console.log("FAILURE" + this.newUser);
                    }
                    else {
                        console.log("SUCCESS" + this.newUser);
                        $state.go('home');
                    }

                    return false;
                });
                this.newItem = {};
            };

            this.userDetails = {};

            this.signIn = () => {
                console.log(this.userDetails.signinEmail);
                console.log(this.userDetails.signinpassword);
                Meteor.loginWithPassword(
                    this.userDetails.signinEmail,
                    this.userDetails.signinpassword,
                    function (error) {
                        if (error) {
                            console.log("FAILURE");
                        }
                        else {
                            $state.go('home');
                        }
                    });

                this.userDetails = {};
            }
        }
    }
});

var ItemStatus = SEnum([
    { key: "available", label: "Available" },
    { key: "pickedUp", label: "Picked Up" },
    { key: "booked", label: "Booked for pickup" },
    { key: "expired", label: "Expired" }
]);

var IsExpired = (item) => {
    var currentDate = new Date();

    return currentDate > item.toDate;
}

var PickupFromDate = (item) => {
    var currentDate = new Date();
    var newDateOffset = 0;
    if (currentDate.getHours() * 60 + currentDate.getMinutes() > item.pickup.time.to) {
        newDateOffset = 1;
    }

    var pickupFrom = new Date(item.pickup.date.from.getFullYear(),
        item.pickup.date.from.getMonth(),
        item.pickup.date.from.getDate() + newDateOffset,
        0,
        item.pickup.time.from);

    var output = {};
    if (pickupFrom > currentDate) {
        output = pickupFrom;
    }
    else {
        output = new Date(currentDate.getFullYear(),
            currentDate.getMonth(),
            currentDate.getDate() + newDateOffset,
            0,
            item.pickup.time.from);
    }

    return output;
}

var PickupToDate = (item) => {
    var output = new Date(item.pickup.date.to.getFullYear(),
        item.pickup.date.to.getMonth(),
        item.pickup.date.to.getDate(),
        0,
        item.pickup.time.to);
    console.log(output);
    return output;
}

angular.module('takeout').directive('profile', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/pages/profile.html',
        controllerAs: 'profile',
        controller: function ($scope, $reactive) {
            $reactive(this).attach($scope);

            this.helpers({
                myItems: () => {
                    return Items.find({ owner: Meteor.user()._id });
                },
                notifications: () => {
                    return Threads.find({ $or: [ 
                        { $and: [ { "readByUser" : false }, { user: Meteor.user()._id } ] }, 
                        { $and: [ { "readByOwner": false }, { ownerId: Meteor.user()._id } ] } 
                        ]}).count();
                },
                activeThreads: () => {
                    return Threads.find({ $or: [ 
                        { $and: [ { "readByUser" : false }, { user: Meteor.user()._id } ] }, 
                        { $and: [ { "readByOwner": false }, { ownerId: Meteor.user()._id } ] } 
                        ]}, { sort: { lastUpdatedTimestamp: -1 } });
                }
            });

            this.isExpired = (item) => {
                return IsExpired(item);
            };
        }
    }
});

angular.module('takeout').directive('addnewitem', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/pages/addnewitem.html',
        controllerAs: 'addnewitem',
        controller: function ($scope, $reactive, $meteor, $state) {
            $reactive(this).attach($scope);

            // Toggle directive for pickuptimes
            $scope.isCollapsed = true;

            $scope.myDatetimeRange = {
                date: {
                    from: new Date(), // start date ( Date object )
                    to: new Date() // end date ( Date object )
                },
                time: {
                    from: 480, // default start time (in minutes)
                    to: 1020, // default end time (in minutes)
                    step: 15, // step width
                    minRange: 15, // min range
                    hours24: false // true = 00:00:00 | false = 00:00 am/pm
                }
            };

            $scope.myDatetimeLabels = {
                date: {
                    from: 'Start date',
                    to: 'End date'
                }
            };

            this.newItem = { "name": "", "description": "", "ageDays": 0, "ageHours": 0, "images": [] };

            this.addItemCB = () => {
                this.newItem.owner = Meteor.user()._id;
                this.newItem.postedDate = new Date();
                this.newItem.images = (this.newItem.images || {}).map((image) => {
                    return image._id;
                });
                this.newItem.pickup = {};
                this.newItem.pickup.fromDate = new Date($scope.myDatetimeRange.date.from.getFullYear(), $scope.myDatetimeRange.date.from.getMonth(), $scope.myDatetimeRange.date.from.getDate(), 0, $scope.myDatetimeRange.time.from);
                this.newItem.pickup.toDate = new Date($scope.myDatetimeRange.date.to.getFullYear(), $scope.myDatetimeRange.date.to.getMonth(), $scope.myDatetimeRange.date.to.getDate(), 0, $scope.myDatetimeRange.time.to);
                this.newItem.threads = [];
                
                //TODO: add error case callback
                Items.insert(this.newItem);
                $state.go('itemslist');
                this.newItem = { "name": "", "description": "", "ageDays": 0, "ageHours": 0, "images": [] };
            }

            this.addItem = (files) => {
                if ($scope.addItemForm.file.$valid && $scope.addItemForm.file) {
                    this.addImages($scope.addItemForm.file, this.addItemCB);
                }
            };

            this.addImages = (files, callback) => {
                Images.insert(files.$modelValue, (err, fileObj) => {
                    if (!this.newItem.images) {
                        this.newItem.images = [];
                    }

                    this.newItem.images.push(fileObj);

                    callback();
                });
            };
        }
    }
});

angular.module('takeout').directive('itemslist', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/pages/itemsList.html',
        controllerAs: 'itemslist',
        controller: function ($scope, $reactive, $filter) {
            $reactive(this).attach($scope);

            this.helpers({
                items: () => {
                    return Items.find({});
                },
                images: () => {
                    return Images.find({});
                }
            });

            this.subscribe('images');

            this.getMainImage = (images) => {
                if (images && images.length && images[0] && images[0]) {
                    var url = $filter('filter')(this.images, { _id: images[0] })[0].url({ store: 'thumbnail' });
                    return {
                        'background-image': 'url("' + url + '")'
                    }
                }
            };

            this.getUserById = (userId) => {
                return Meteor.users.findOne(userId);
            };

            this.removeItem = (item) => {
                if (item.owner == Meteor.user()._id) {
                    Items.remove({ _id: item._id });
                }
            }
        }
    }
});

angular.module('takeout').directive('itemdetails', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/pages/item-details.html',
        controllerAs: 'itemdetails',
        controller: function ($scope, $reactive, $stateParams, $filter) {
            $reactive(this).attach($scope);

            this.itemId = $stateParams.itemId;
            this.user = Meteor.user()._id;
            
            this.helpers({
                item: () => {
                    return Items.findOne({ _id: this.itemId });
                },
                images: () => {
                    return Images.find({});
                },
                thread: () => {
                    var item = Items.findOne({ _id: this.itemId });
                    if (!item || !item.threads)
                    {
                        return null;
                    }
                    
                    return Threads.findOne({ _id: { $in: item.threads }, ownerId: item.owner, user: this.getReactively('user') });
                },
                user: () => {
                    return this.user;
                },
                getAllThreads: () => {
                    var item = Items.findOne({ _id: this.itemId });
                    if (!item || !item.threads || item.owner != Meteor.user()._id)
                    {
                        return null;
                    }
                    
                    return Threads.find({ _id: { $in: item.threads } });
                }
            });

            this.getUserById = (userId) => {
                return Meteor.users.findOne(userId);
            };

            this.subscribe('images');

            this.getMainImage = (images) => {
                if (images && images.length && images[0] && images[0]) {
                    var url = $filter('filter')(this.images, { _id: images[0] })[0].url();
                    return {
                        'background-image': 'url("' + url + '")'
                    }
                }
            };

            this.isExpired = (item) => {
                return IsExpired(item);
            };

            this.msgToAdd = { "message": "", "author": "", "timestamp": new Date(), "isRead": false };
            
            this.markAsRead = (item) => {
                var thread = Threads.findOne({ _id: { $in: item.threads }, ownerId: item.owner, user: this.user });
                console.log(thread);
                if (thread) {
                    var readByUser = thread.user == Meteor.user()._id ? true : thread.readByUser;
                    var readByOwner = thread.ownerId == Meteor.user()._id ? true : thread.readByOwner;
                    Threads.update({ _id: thread._id }, { $set: { "readByUser": readByUser, "readByOwner": readByOwner } });
                }
            }
            
            this.markAsPickedUp = (item) => {
                // on pick up add a new pickup field
                Meteor.call('markAsPickedUp', this.item._id, this.user, (error) => {
                    if (error) {
                        console.log('Oops, unable to update!');
                    }
                    else {
                        console.log('Updated!');
                    }
                });
            }
            
            var addMessageToThread = function (item, message, user) {
                    console.log(item);
                    console.log(message);
                    var thread = Threads.findOne({ _id: { $in: item.threads }, ownerId: item.owner, user: user });
                    console.log(thread);
                    var isThreadFound = true;
                    if (!thread) {
                        isThreadFound = false;
                        // create a thread
                        var newThread = {};
                        newThread.ownerId = item.owner;
                        newThread.user = user;
                        newThread.messages = [];
                        newThread.isOpen = true;
                        newThread.readByUser = true;
                        newThread.readByOwner = false;
                        newThread.lastUpdatedTimestamp = new Date();
                        newThread.itemId = item._id 
                        thread = newThread;
                    }
                    console.log(thread);
                    message.author = Meteor.user()._id;
                    message.timestamp = new Date();

                    if (!isThreadFound) {
                        console.log("istf" + isThreadFound);
                        thread.messages.push(message);
                        Threads.insert(thread, function (err, addedThread) {
                            if (err) {
                                //handle    
                                console.log(err);
                            }
                            console.log(addedThread);
                            Items.update({ _id: item._id }, { $push: { "threads": addedThread } }, function (err, updateDocs) {
                                if (err) {
                                    console.log(err);
                                }
                                console.log(updateDocs);
                                console.log("done");
                            });
                        });
                    }
                    else {
                        var readByUser = item.owner != Meteor.user()._id;
                        var readByOwner = item.owner == Meteor.user()._id;
                        Threads.update({ _id: thread._id }, { $push: { "messages": message }, $set: { "readByUser": readByUser, "readByOwner": readByOwner, "lastUpdatedTimestamp": new Date()} });
                    }
                }
                
            this.requestItem = (item) => {
                addMessageToThread(item, { "message" : "Hey I'm interested in this item!" }, this.user);
            }
            
            this.addToThread = (item) => {
                // Look if there is already a thread between this user and the onwer for this item
                console.log(this.msgToAdd);
                if (!item.threads) {
                    Items.update({ _id: this.itemId }, { $set: { threads: [] } }, function (err) {
                        if (err) {
                            //handle
                        }

                        addMessageToThread(item, this.msgToAdd, this.user);
                        this.msgToAdd = { "message": "" };
                    });
                }
                else {
                    addMessageToThread(item, this.msgToAdd, this.user);
                    this.msgToAdd = { "message": "" };
                }
            }
        }
    }
});

angular.module('takeout').directive('userinfo', function () {
    return {
        restrict: 'E',
        templateUrl: 'client/pages/userInfo.html',
        controllerAs: 'userinfo',
        controller: function ($scope, $reactive, $stateParams, $filter) {
            $reactive(this).attach($scope);
            
            
            this.userId = $stateParams.userId;
            this.testimonialText = "";
            this.rate = 4;
            this.max = 5;
            this.isReadonly = false;
            this.hoveringOver = function (value) {
                this.overStar = value;
            };
            
            this.helpers({
                user: () => {
                    return Meteor.users.findOne({ _id: this.userId });
                },
                itemsDonated: () => {
                    return Items.find({ owner: this.userId });
                },
                itemsPickedUp: () => {
                    var user = Meteor.users.findOne({ _id: this.userId });
                    return Items.find( { _id: { $in :  user.profile.itemsPickedUpList } });
                },
                testimonials: () => {
                    return Testimonials.find({ownerId: this.userId });
                },
                averageRating: () => {
                    var runningTotal = 0;
                    var totalNumber = 0;
                    Testimonials.find({ownerId: this.userId }).forEach(function (testimonial) {
                        runningTotal += testimonial.rating;
                        totalNumber++;
                    });
                    
                    if (totalNumber == 0) {
                        return 0;
                    }
                    else {
                        return runningTotal / totalNumber;
                    }
                },
                myTestimonial: () => {
                    var myTestimonial = Testimonials.findOne({ownerId: this.userId, user: Meteor.user()._id });
                    if (myTestimonial) {
                        this.rate = myTestimonial.rating;
                        this.testimonialText = myTestimonial.message;
                    }
                    else {
                        this.rate = 3;
                        this.testimonialText = "I thought they were great!";
                    }
                }
            });
            
            this.isExpired = (item) => {
                return IsExpired(item);
            };
            
            this.userName = (userId) => {
                var foundUser = Meteor.users.findOne({ _id: userId });
                return foundUser.profile.firstName + " " + foundUser.profile.lastName;
            };
            
            this.addTestiminial = () => {
                var testimonialsForThisUser = Testimonials.findOne({ownerId: this.userId, user : Meteor.user()._id });
                
                var newTestimonial = testimonialsForThisUser == null;
                
                var testimonial = {};
                    testimonial.ownerId = this.userId;
                    testimonial.user = Meteor.user()._id;
                    testimonial.rating = this.rate;
                    testimonial.message = this.testimonialText;
                    testimonial.date = new Date();
                    
                if (newTestimonial) {
                    Testimonials.insert(testimonial, function(err, addedTestimonial) {
                        if (err) {
                            console.log(err);
                        };
                    });
                }
                else {
                    console.log(testimonial);
                    Testimonials.update(testimonialsForThisUser._id, { $set: testimonial }, function(err, updatedDocs) {
                        if (err) {
                            console.log(err);
                        }
                        
                        console.log(updatedDocs);
                    });
                }
                
                this.testimonialText = "";
            }
        }
    }
});