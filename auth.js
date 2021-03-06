const User = require("../models/user");
const Order = require("../models/order");

//confirm user id with frontend and backend middleware
exports.findUserById = (req, res, next, id) => {
    User.findById(id).exec((err, user) => {
        if(err || !user) {
            return res.status(400).json({
                error: "No user found in DB"
            });
        }
        //Getting id for frontend
        req.profile = user;
        next();
    });
};

exports.getUser = (req,res) => {
    req.profile.salt = undefined;
    req.profile.encry_password = undefined;
    req.profile.createdAt = undefined;
    req.profile.updatedAt = undefined;
    return res.json(req.profile)
}


exports.updateUser = (req,res) => {
    User.findByIdAndUpdate(
        { _id: req.profile._id},
        { $set: req.body},
        { new: true, useFindAndModify: false},
        (err, user) => {
            if(err) {
                return res.status(400).json({
                    error: "Unauthorised to change the information"
                });
            }
            user.salt = undefined;
            user.encry_password = undefined;
            res.json(user);
        });
}

exports.userPurchaseList = (req,res) => {
    Order.find({ user: req.profile._id })
    .populate("user", "_id name")
    .exec((err, order) => {
        if(err) {
            return res.status(400).json({
                error: "No order in this account"
            });
        }
        return res.json(order);
    })
}


exports.pushOrderInPurchaseList = (req, res, next) => {
    let purchases = []
    req.body.order.products.forEach(product => {
        purchases.push({
            _id: products._id,
            name: products.name,
            description: products.description,
            category: products.category,
            amount: req.body.order.amount,
            transaction_id: req.body.order.transaction_id,
        });
    });

    //store in DB
    User.findOneAndUpdate(
        {_id: req.profile._id},
        {$push: {purchases: purchases}}, //1st purchase is the array of user model and 2nd is user-controller pushOrderInPurchaseList middleware
        {new: true},
        (err, purchases) => {
            if(err) {
                return res.status(400).json({
                    error: "Unable to update purchase list"
                });
            }
            next();
        }
    )

}
