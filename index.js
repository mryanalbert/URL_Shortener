const express = require('express');
const mongo = require('mongodb');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const dns = require('dns');
require('dotenv').config();
mongoose.connect('mongodb+srv://mryanalbert:JE1otipbTbM9YlKG@cluster0-x2hka.mongodb.net/test?retryWrites=true&w=majority');
// local database - mongodb://localhost:27017/test, { useNewUrlParser: true }

let Schema = mongoose.Schema;

let urlSchema = new Schema({
    original_site: String,
    side_code: Number
});

let urlModel = mongoose.model('site_code', urlSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());

app.use('/public', express.static(process.cwd() + '/public'));

app.get('/', function(req, res){
  res.sendFile(process.cwd() + '/views/index.html');
});

app.post('/api/shorturl/new', (req, res) => {
    let regex = /^(http:\/\/www\.|https:\/\/www\.|http:\/\/|https:\/\/)/gi;
    let origSite = req.body.urlsite;
    let ranCode = Math.floor(Math.random() * 1000000);

    if (regex.test(origSite)) {
        let replaced = origSite.replace(regex, '');

        dns.lookup(replaced, (err, address, family) => {
            if (address == undefined) {
                res.json({ "error":"invalid URL" });
            } else { 
            // can be searched
                urlModel.find().exec().then(d => {
                    let data = d;
                    data = data.filter(obj => obj.original_site == origSite);

                    if (data.length === 0) {
                        res.json({ original_url: origSite, short_url: ranCode });
                        new urlModel({ original_site: origSite, side_code: ranCode }).save();
                    } else {
                        res.json({ original_url: origSite, short_url: data[0].side_code });
                    }
                });
            }
        });
    } else {
        res.json({ "error":"invalid URL" });
    }
});

app.get('/api/shorturl/:code', (req, res) => {
    let urlCode = req.params.code;
    urlModel.findOne({ side_code: urlCode }, (err, data) => {
        res.redirect(301, data.original_site);
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log('Server running on port ' + PORT));