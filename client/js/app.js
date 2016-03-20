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
    if (currentDate.getHours() * 60 + currentDate.getMinutes() > item.pickup.time.to)
    {
        newDateOffset = 1;
    }
    
    var pickupFrom = new Date(item.pickup.date.from.getFullYear(), 
        item.pickup.date.from.getMonth(), 
        item.pickup.date.from.getDate() + newDateOffset, 
        0, 
        item.pickup.time.from);
        
    var output = {};
    if (pickupFrom > currentDate)
    {
        output = pickupFrom;
    }
    else
    {
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
                Items.insert(this.newItem);
                console.log(this.newItem);
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
            this.helpers({
                item: () => {
                    return Items.findOne({ _id: this.itemId });
                },
                images: () => {
                    return Images.find({});
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
        }
    }
});