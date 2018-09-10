app.factory('DataTransfer', function () {

    var data = {};

    return {
        getUserDetails: function () {
            return data;
        },
        setUserDetails: function (UserDetails) {
            data = UserDetails;
        }
    };
});