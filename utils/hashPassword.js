import {hash,genSalt,compare} from 'bcrypt'

async function hashPassword(password) {
    const salt = await genSalt(10);
    return hash(password, salt);
}


export default hashPassword;