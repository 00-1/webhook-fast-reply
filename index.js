const request = require('request');
//const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();    

/**
 * Responds to any HTTP request.
 *
 * @param {!Object} req HTTP request context.
 * @param {!Object} res HTTP response context.
 */

exports.btcsim = async (req, res) => {

  // log values
  console.log('method', req.method)
  console.log('body', req.body)
  console.log('slack url', `https://hooks.slack.com/services/${process.env.SLACK_KEY}`)

  // deal with posts
  if (req.method == 'POST') {

    // when first connected to bot need to respond to challenge
    if (req.body.hasOwnProperty('challenge')) {
      res.status(200).send({challenge: req.body.challenge});
    } else if (req.body.event.type=='app_mention') {

      // check if we've already got this message
      const doc = admin.firestore().collection('messages').doc(req.body.event_id) 
      const existing = await doc.get()
      console.log(existing)

      // give slack a 200 ASAP to avoid 3000ms timeout
      // note this has to be disabled to send a meaningful response, like the challenge reply
      console.log('responding asap')
      res.sendStatus(200);

      // check if the document was already written
      if (!existing.exists) {
            // respond to query
            request.post(
              `https://hooks.slack.com/services/${process.env.SLACK_KEY}`,
              { json: { text: 'Alright, message received. It will be logged.' } },
              function (error, response, body) {
	        console.log('Sent', error, response, body)
              }
            );

            // write the message to db         
            const result = await doc.set(req.body); 
            console.log('Written document:', result)
                 
      } else {
        console.log("Already exists", existing.data())
      }
    }
  }

	
};

