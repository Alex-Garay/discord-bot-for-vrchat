import dotenv from "dotenv";
import websocket from 'websocket'
import axios from "axios";
import vrchat from "vrchat";
import moment from 'moment';
import { Client, Intents } from 'discord.js';
dotenv.config();
axios.defaults.headers = {
    'Content-Type': 'application/json',
    Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`
}

const WebSocketClient = websocket.client
const client = new WebSocketClient();
const discord = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]});

const configuration = new vrchat.Configuration({
    username: `${process.env.VRC_USERNAME}`,
    password: `${process.env.VRC_PASSWORD}`
});

const AuthenticationApi = new vrchat.AuthenticationApi(configuration);
const FriendsApi = new vrchat.FriendsApi(configuration);

let onlineFriends = [];
let friendId = {};

const updateDiscord = () => {
    axios({
        method: 'patch',
        url: `https://discord.com/api/channels/${process.env.DISCORD_CHANNEL_ID}/messages/${process.env.DISCORD_MESSAGE_ID}`,
        data: {
            "content": `Currently Online (Last Updated: ${moment().format('LTS')}): ${onlineFriends.map((friend) => {
                return `<:6164lightgreensmalldot:904307577192607754>${friend}`
            })}`
        }
    });
}

const updateFriends = () => {
    AuthenticationApi.getCurrentUser()
        .then(() => {
            FriendsApi.getFriends()
                .then(({ data: friends }) => {
                    onlineFriends = [];
                    friends.map((friend) => {
                        friendId[friend.id] = friend.displayName;
                        if (friend.location.length > 0 && friend.displayName !== "Snuggfighter" && friend.displayName !== "AwesomePizza_01" && friend.displayName !== "Angel_wolfyvr" && friend.displayName !== "xero_chris" && friend.displayName !== "Alfafles c3a1" && friend.displayName !== "S̳l̳u̳g̳s̳V̳R̳" && friend.displayName !== "XenoRyoga" && friend.displayName !== "Spartan81000" && friend.displayName !== "Tayッ a421") {
                            onlineFriends.push(friend.displayName);
                        }
                    })
                    console.log(onlineFriends);
                    updateDiscord();
                })
        })
}
updateFriends();
client.on("connect", (connection) => {
    console.log('WebSocket Client Connected');
    connection.on('error', function (error) {
        console.log("Connection Error: " + error.toString());
    });
    connection.on('close', function () {
        console.log('echo-protocol Connection Closed');
        connectWebsocket()
    });
    connection.on('message', function (message) {
        if (message.type === 'utf8') {
            let parsed = JSON.parse(message.utf8Data);
            let { type, content } = parsed;
            // if (message.type === 'utf8') { 
            //     content = JSON.parse(content);
            // }
            if (type === "friend-offline") {
                // console.log(`${friendId[content.userId]} has gone offline.`);
                // onlineFriends = onlineFriends.filter((friend) => {
                //     return friend !== `${friendId[content.userId]}`;
                // })
                // console.log(onlineFriends);
                updateFriends();
                // updateDiscord();
            }
    
            if (type === "friend-online") {
                // console.log(`${content.user.displayName} has gone online.`);
                // if (onlineFriends.indexOf(content.user.displayName) === -1 && content.user.displayName !== "xero_chris" && content.user.displayName !== "Alfafles c3a1" && content.user.displayName !== "S̳l̳u̳g̳s̳V̳R̳" && content.user.displayName !== "ShortyPebbles20" && content.user.displayName !== "XenoRyoga" && content.user.displayName !== "Spartan81000" && content.user.displayName !== "Tayッ a421") {
                //     onlineFriends.push(content.user.displayName)
                // }
                // console.log(onlineFriends)
                updateFriends();
                // updateDiscord();
            }
    
            if (type === "friend-active") {
                // console.log(`${content.user.displayName} has gone active.`)
            }
        }

    });
})

discord.login(process.env.DISCORD_BOT_TOKEN);
client.connect(
    `wss://pipeline.vrchat.cloud/?authToken=${process.env.VRC_AUTH_TOKEN}`,
    "echo-protocol",
    null,
    {
        "User-Agent": "Mozilla/5.0 (platform; rv:geckoversion) Gecko/geckotrail Firefox/firefoxversion"
    }
);