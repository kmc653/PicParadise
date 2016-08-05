// 'use strict';

// if(process.env.NODE_ENV === 'production') {
//     // Offer production stage environment variables
//     module.exports = {
//         host: process.env.host || "",
//         dbURI: process.env.dbURI,
//         sessionSecret: process.env.sessionSecret,
//         fb: {
//             clientID: process.env.fbClientID,
//             clientSecret: process.env.fbClientSecret,
//             callbackURL: process.env.host + "/auth/facebook/callback",
//             profileFields: ['id', 'displayName', 'photos']
//         },
//         S3AccessKey: process.env.S3AccessKey,
//         S3Secret: process.env.S3Secret,
//         S3Bucket: process.env.S3Bucket
//     }
// } else {
//     // Offer dev stage settings and data
//     module.exports = require('./development.json');
// }
module.exports = require('./' + (process.env.NODE_ENV || 'development' + '.json'));