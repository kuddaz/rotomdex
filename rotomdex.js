// Node version check
if (process.version.slice(1).split(".")[0] < 8) throw new Error("Node 8.0.0 or higher is required. Update Node on your system.");

// Load d.js library + others
const Discord = require("discord.js");
const { promisify } = require("util");
const readdir = promisify(require("fs").readdir);
const Enmap = require("enmap");
const Provider = require("enmap-sqlite");
const EnmapPGSql = require("enmap-pgsql");

// Bot
const client = new Discord.Client();

// Config file
client.config = require("./config.js");
client.logger = require("./util/Logger");

require("./modules/functions.js")(client);

client.commands = new Enmap();
client.aliases = new Enmap();
client.test = new Enmap({provider: new Provider({name: "test"})});
client.script = new Enmap ({provider: new Provider({name: "script"})});
client.pokedex_lookup = new Enmap({provider: new Provider({name: "pokedex_lookup"})});
client.pokedex = new Enmap({provider: new Provider({name: "pokedex"})});
client.typedex = new Enmap({provider: new Provider({name: "typedex"})});
client.abilitydex_lookup = new Enmap({provider: new Provider({name: "abilitydex_lookup"})});
client.abilitydex = new Enmap({provider: new Provider({name: "abilitydex"})});

//client.settings = new Enmap({provider: new Provider({name: "settings"})});
client.settings = new Enmap({provider: new EnmapPGSql({name: "settings", connectionString: process.env.DATABASE_URL})});

const init = async () => {

  // load commands
  const cmdFiles = await readdir("./commands/");
  client.logger.log(`Loading a total of ${cmdFiles.length} commands.`);
  cmdFiles.forEach(f => {
    if (!f.endsWith(".js")) return;
    const response = client.loadCommand(f);
    if (response) console.log(response);
  });

  // load events
  const evtFiles = await readdir("./events/");
  client.logger.log(`Loading a total of ${evtFiles.length} events.`);
  evtFiles.forEach(file => {
    const eventName = file.split(".")[0];
    const event = require(`./events/${file}`);
    client.on(eventName, (...args) => event.run(client, ...args));
    delete require.cache[require.resolve(`./events/${file}`)];
  });

  //login
  client.login(client.config.token);
};

init();
