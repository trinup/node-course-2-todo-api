const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');

var data = {
    id: 10
};

var token = jwt.sign(data, 'secretsalt');
console.log(token);
console.log(jwt.verify(token, 'secretsalt'));

// var message = 'I am user number 3';
// var hash = SHA256(message).toString();

// // console.log(`Message: ${message}`);
// // console.log(`Hash: ${hash}`);

// var data = {
//     id: 4
// };
// var token = {
//     data,
//     hash: SHA256(JSON.stringify(data) + 'secretsalt').toString()
// };

// var resultHash = SHA256(JSON.stringify(token.data) + 'secretsalt').toString();

// if (resultHash === token.hash) {
//     console.log('Data not manipulated');
// } else {
//     console.log('Data manipulated');
// }
