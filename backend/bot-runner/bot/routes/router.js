const express = require('express');
const router = express.Router();

// Controller
const {showRanking} = require("../services/cronWorker");

router.get('/ping', (req, res) => {
  res.send("OK!")
});

router.get('/cron/ranking/:dev', async (req, res) => {
  const isDev = req.params.dev === "dev" ? true : false;
  res.json(req.params);
  // const apiKey = req.headers['x-api-key']
  // if (apiKey != 'a9eb03b0-0d3a-4a40-9d09-0bdc6b560a14') {
  //   res.status(401).json({message: "Un authorised"})
  //   return
  // }
  // const title = req.body.title;
  // showRanking(isDev,title);
  // res.json({message: isDev})
})

module.exports = router;
