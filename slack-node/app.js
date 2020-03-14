const express = require('express')
const bodyParser = require('body-parser')
const { createEventAdapter } = require('@slack/events-api')
const { createMessageAdapter } = require('@slack/interactive-messages')
const { WebClient } = require('@slack/web-api')
const axios = require('axios')
const request = require('request')
const _ = require('lodash');

const port = process.env.PORT || 3000
const app = express()
const token = process.env.SLACK_BOT_TOKEN
const webClient = new WebClient(token)

const webClients = [{"team":'TVDRL7B0C',"webClient":new WebClient('xoxb-999870249012-1002190822631-786spnSvC9ImiWjhXnKojm5M')}];

const slackEvents = createEventAdapter(process.env.SLACK_SIGNING_SECRET)
const slackInteractions = createMessageAdapter(process.env.SLACK_SIGNING_SECRET)

app.use('/slack/events', slackEvents.expressMiddleware())
app.use('/slack/actions', slackInteractions.expressMiddleware())

app.use(bodyParser.urlencoded({extended: true}))
app.use(bodyParser.json())

//oauth:foreman
app.get('/auth/redirect', (req, res) =>{
    var options = {
        uri: 'https://slack.com/api/oauth.v2.access?code='
            +req.query.code+
            '&client_id='+process.env.SLACK_CLIENT_ID+
            '&client_secret='+process.env.SLACK_CLIENT_SECRET,
            // '&redirect_uri='+process.env.REDIRECT_URI,
        method: 'POST'
    }
    request(options, (error, response, body) => {
        var JSONresponse = JSON.parse(body)
        if (!JSONresponse.ok){
            console.log(JSONresponse)
            res.send("Error encountered: \n"+JSON.stringify(JSONresponse)).status(200).end()
        }else{
            console.log(JSONresponse)
            res.send("Success!")
        }
    })
});

//slash command, not find any nodjs package for the command
app.post('/slack/command', (req,res)=>{

  var response_url = req.body.response_url;
  simulateSearch(response_url);

  console.log("ack");
  res.send();
});

async function simulateSearch(response_url){
  console.log("simulate the search....."+response_url);
  await new Promise (resolve => {
    setTimeout(resolve, 1000)
  })

  axios.post(response_url,{
    "text": "Search DONE."
  }).then((res) => {
    console.log('success')
  });
}

slackEvents.on('app_mention', async (event) => {
  try {

    console.log(JSON.stringify(event));

    const mentionResponseBlock = { ...messageJsonBlock, ...{channel: event.channel}}
    var client = webClient;
    var clientsFound = _.filter(webClients, x => x.team === event.team);
    if(clientsFound && clientsFound.length == 1){
      client = clientsFound[0].webClient;
      console.log("Find client for team : "+ event.team);
    }else{
      console.log("The app is owned by team: "+ event.team);
    }
    
    const res = await client.chat.postMessage(mentionResponseBlock)
    console.log('Message sent: ', res.ts)
  } catch (e) {
    console.log("ERR1");
    console.log(e);
    console.log(JSON.stringify(e))
  }
})

slackInteractions.action({ actionId: 'open_modal_button' }, async (payload) => {

  console.log(JSON.stringify(payload))

  try {
    await webClient.views.open({
        trigger_id: payload.trigger_id,
        view: modalJsonBlock
      }
    )
  } catch (e) {
    console.log(JSON.stringify(e))
  }

  // The return value is used to update the message where the action occurred immediately.
  // Use this to items like buttons and menus that you only want a user to interact with once.
  return {
    text: 'Processing...',
  }
})

slackInteractions.viewSubmission('cute_animal_modal_submit' , async (payload) => {
  const blockData = payload.view.state

  const cuteAnimalSelection = blockData.values.cute_animal_selection_block.cute_animal_selection_element.selected_option.value
  const nameInput = blockData.values.cute_animal_name_block.cute_animal_name_element.value

  console.log(cuteAnimalSelection, nameInput)

  if (nameInput.length < 2) {
    return {
      "response_action": "errors",
      "errors": {
        "cute_animal_name_block": "Cute animal names must have more than one letter."
      }
    }
  }
  return {
    response_action: "clear"
  }
})

// Starts server
app.listen(port, function() {
  console.log('Bot is listening on port ' + port)
})

const messageJsonBlock = {
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Hello, thanks for calling me. Would you like to launch a modal?"
      },
      "accessory": {
        "type": "button",
        "action_id": "open_modal_button", // We need to add this
        "text": {
          "type": "plain_text",
          "text": "Launch",
          "emoji": true
        },
        "value": "launch_button_click"
      }
    }
  ]
}

const modalJsonBlock = {
  "type": "modal",
  "callback_id": "cute_animal_modal_submit", // We need to add this
  "title": {
    "type": "plain_text",
    "text": "My App",
    "emoji": true
  },
  "submit": {
    "type": "plain_text",
    "text": "Done",
    "emoji": true
  },
  "close": {
    "type": "plain_text",
    "text": "Cancel",
    "emoji": true
  },
  "blocks": [
    {
      "type": "section",
      "text": {
        "type": "mrkdwn",
        "text": "Thanks for openeing this modal!"
      }
    },
    {
      "type": "input",
      "block_id": "cute_animal_selection_block", // put this here to identify the selection block
      "element": {
        "type": "static_select",
        "action_id": "cute_animal_selection_element", // put this here to identify the selection element
        "placeholder": {
          "type": "plain_text",
          "text": "Select a cute animal",
          "emoji": true
        },
        "options": [
          {
            "text": {
              "type": "plain_text",
              "text": "Puppy",
              "emoji": true
            },
            "value": "puppy"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Kitten",
              "emoji": true
            },
            "value": "kitten"
          },
          {
            "text": {
              "type": "plain_text",
              "text": "Bunny",
              "emoji": true
            },
            "value": "bunny"
          }
        ]
      },
      "label": {
        "type": "plain_text",
        "text": "Choose a cute pet:",
        "emoji": true
      }
    },
    {
      "type": "input",
      "block_id": "cute_animal_name_block", // put this here to identify the input.
      "element": {
        "type": "plain_text_input",
        "action_id": "cute_animal_name_element" // put this here to identify the selection element

      },
      "label": {
        "type": "plain_text",
        "text": "Give it a cute name:",
        "emoji": true
      }
    }
  ]
}
