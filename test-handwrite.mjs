import axios from 'axios';
import FormData from 'form-data';
import fs from 'node:fs';

// const res = axios.get('https://api2.handwrytten.com/api/v1/auth/getUser?uid=4767daa3c1ea494fb9102201b2352b12');

// res.then(console.log);

const file = fs.readFileSync('./greeting-card-7x5-template.png');

const formData = new FormData();
formData.append('type', 'cover');
formData.append('file', fs.createReadStream('./greeting-card-7x5-template.png'));

const res2 = axios.post(
  'https://api2.handwrytten.com/api/v1/user/cards/uploadCustomLogo?uid=4767daa3c1ea494fb9102201b2352b12',
  formData
);

res2.then(console.log).catch(console.error);
