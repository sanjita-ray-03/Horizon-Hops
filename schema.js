const joi = require('joi');


module.exports.listingschema = joi.object({
    listing: joi.object({
        titile: joi.string().required(),
        Description: joi.string().required(),
        country: joi.string().required(),
        price: joi.number().required().min(0),
        image: joi.string().allow("", null),
    }).required()
});