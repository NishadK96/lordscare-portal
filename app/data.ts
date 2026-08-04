export type BankCommand = {
  command: string;
  description: string;
  example?: string;
  group: "General" | "Search" | "Balance" | "Resources";
  admin: boolean;
};

// Based on the official Lords Bot Guild Bank command reference.
// "admin" groups commands that control the bank, guild, other players, or balances.
// Actual availability is determined by the minimum ranks configured in Lords Bot.
export const commands: BankCommand[] = [
  { command: "!ess", description: "Mail the status of the transmutation lab.", example: "!ess", group: "General", admin: false },
  { command: "!stats", description: "Mail your Guild Gift statistics since the last reset.", example: "!stats", group: "General", admin: false },
  { command: "!reguser [profile ID]", description: "Bind your Discord or Telegram profile to your in-game castle.", example: "!reguser 423423958239", group: "General", admin: false },
  { command: "!unreguser [profile ID]", description: "Unbind your Discord or Telegram profile from your castle.", example: "!unreguser 423423958239", group: "General", admin: false },
  { command: "!pos", description: "Mail the exact Guild Bank location.", example: "!pos", group: "General", admin: false },
  { command: "!shield", description: "Check when the Guild Bank shield expires.", example: "!shield", group: "General", admin: false },
  { command: "!quest", description: "Mail the Guild Bank's Guild Fest status.", example: "!quest", group: "General", admin: false },

  { command: "!findtile [type] [level]", description: "Find a resource tile around the Guild Bank.", example: "!findtile food 4", group: "Search", admin: false },
  { command: "!findtile any [level]", description: "Find any resource tile of a chosen level around the Guild Bank.", example: "!findtile any 4", group: "Search", admin: false },
  { command: "!findtilelocal [type] [level]", description: "Find a resource tile around the castle that sent the command.", example: "!findtilelocal food 4", group: "Search", admin: false },
  { command: "!findmonster [monster] [level]", description: "Find a named monster around the Guild Bank.", example: "!findmonster hardrox 2", group: "Search", admin: false },
  { command: "!findmonster any [level]", description: "Find any monster of a chosen level around the Guild Bank.", example: "!findmonster any 2", group: "Search", admin: false },
  { command: "!findmonsterlocal [monster] [level]", description: "Find a named monster around the castle that sent the command.", example: "!findmonsterlocal hardrox 2", group: "Search", admin: false },
  { command: "!findnest [level]", description: "Find a Darknest around the Guild Bank.", example: "!findnest 3", group: "Search", admin: false },
  { command: "!findnestlocal [level]", description: "Find a Darknest around the castle that sent the command.", example: "!findnestlocal 3", group: "Search", admin: false },

  { command: "!bal", description: "Check your resource balance with the bank.", example: "!bal", group: "Balance", admin: false },
  { command: "!setacc [player]", description: "Credit future resources you send to another player's balance.", example: "!setacc Shark", group: "Balance", admin: false },
  { command: "!transfer [player] [type] [amount]", description: "Transfer your recorded resource balance to another player.", example: "!transfer Shark gold 50M", group: "Balance", admin: false },

  { command: "![type] [amount]", description: "Request one resource type: food, stone, wood, ore, or gold.", example: "!food 5M", group: "Resources", admin: false },
  { command: "!rss [F] [S] [W] [O] [G]", description: "Request food, stone, wood, ore, and gold in one command.", example: "!rss 5M 5M 5M 5M 0", group: "Resources", admin: false },
  { command: "!donate[type] [player] [amount]", description: "Send a specific resource to another player using your balance.", example: "!donatefood Shark 5M", group: "Resources", admin: false },

  { command: "!payransom", description: "Pay any outstanding ransom for the bank account's leader.", example: "!payransom", group: "General", admin: true },
  { command: "!clearboard", description: "Clear all quests from the Guild Fest board.", example: "!clearboard", group: "General", admin: true },
  { command: "!stats all", description: "Mail a summary of the guild's purchase and monster gifts.", example: "!stats all", group: "General", admin: true },
  { command: "!pstats [player]", description: "Mail the Guild Gift statistics for another player.", example: "!pstats Simon_Cat", group: "General", admin: true },
  { command: "!gryphon", description: "Activate the Gryphon familiar skill.", example: "!gryphon", group: "General", admin: true },
  { command: "!shield deploy", description: "Deploy a shield on the Guild Bank.", example: "!shield deploy", group: "General", admin: true },
  { command: "!relocate [X] [Y]", description: "Relocate the Guild Bank to chosen coordinates.", example: "!relocate 243 209", group: "General", admin: true },
  { command: "!relocate rand", description: "Relocate the Guild Bank to a random map position.", example: "!relocate rand", group: "General", admin: true },
  { command: "!relocatekvk [K]", description: "Randomly relocate the Guild Bank into a target KVK kingdom.", example: "!relocatekvk 60", group: "General", admin: true },
  { command: "!migrate [K] [X] [Y]", description: "Migrate the Guild Bank to a target kingdom and coordinates.", example: "!migrate 60 200 900", group: "General", admin: true },
  { command: "!recall", description: "Recall all troops except troops currently marching.", example: "!recall", group: "General", admin: true },
  { command: "!buildspam [amount] [delay]", description: "Spam guild helps for Guild Fest or Guild Coins with a delay in seconds.", example: "!buildspam 120 5", group: "General", admin: true },
  { command: "!buildspam stop", description: "Stop the active build-spam task.", example: "!buildspam stop", group: "General", admin: true },
  { command: "!hunt [X] [Y]", description: "Hunt the monster at the specified coordinates.", example: "!hunt 150 166", group: "General", admin: true },
  { command: "!hunt [on/off]", description: "Enable or disable hunting for the Guild Bank account.", example: "!hunt on", group: "General", admin: true },
  { command: "!addtitle [player] [title]", description: "Give a title when the Guild Bank is regent.", example: "!addtitle Shark chief", group: "General", admin: true },
  { command: "!deltitle [title]", description: "Remove a specified title from its current player.", example: "!deltitle chief", group: "General", admin: true },
  { command: "!whitelist [player] [rank]", description: "Accept a player into the guild and assign a rank.", example: "!whitelist Shark R4", group: "General", admin: true },
  { command: "!blacklist [player]", description: "Reject or remove a player and add them to the blacklist.", example: "!blacklist Shark", group: "General", admin: true },
  { command: "!unlistwhite [player]", description: "Remove a player from the whitelist.", example: "!unlistwhite Shark", group: "General", admin: true },
  { command: "!unlistblack [player]", description: "Remove a player from the blacklist.", example: "!unlistblack Shark", group: "General", admin: true },
  { command: "!purge", description: "Clear the Guild Chat.", example: "!purge", group: "General", admin: true },
  { command: "!abort", description: "Cancel all queued resource shipments.", example: "!abort", group: "General", admin: true },
  { command: "!yell [message]", description: "Post a message in Guild Chat.", example: "!yell hello", group: "General", admin: true },
  { command: "!guild [tag]", description: "Leave the current guild and attempt to join another guild.", example: "!guild 123", group: "General", admin: true },
  { command: "!camp / !campleader [X] [Y]", description: "Send a one-troop camp to chosen coordinates.", example: "!camp 100 100", group: "General", admin: true },
  { command: "!setgather [on/off]", description: "Enable or disable gathering for the Guild Bank account.", example: "!setgather off", group: "General", admin: true },
  { command: "!snowbeast", description: "Activate the Snow Beast familiar skill.", example: "!snowbeast", group: "General", admin: true },
  { command: "!stop [seconds]", description: "Take the Guild Bank account offline for a chosen number of seconds.", example: "!stop 60", group: "General", admin: true },
  { command: "!reloadacc", description: "Forcefully reset the Guild Bank account.", example: "!reloadacc", group: "General", admin: true },
  { command: "!members", description: "Force a refresh of the guild member list.", example: "!members", group: "General", admin: true },
  { command: "!busrank", description: "Promote members who completed hunting from R1 to R2.", example: "!busrank", group: "General", admin: true },
  { command: "!resetstats", description: "Reset Guild Gift statistics for the current period.", example: "!resetstats", group: "General", admin: true },
  { command: "!joingvg", description: "Join Guild Expedition.", example: "!joingvg", group: "General", admin: true },
  { command: "!leavegvg", description: "Leave Guild Expedition.", example: "!leavegvg", group: "General", admin: true },
  { command: "!joinca [arena]", description: "Join the selected Chaos Arena.", example: "!joinca 1", group: "General", admin: true },
  { command: "!leaveca", description: "Leave Chaos Arena and return to the normal kingdom.", example: "!leaveca", group: "General", admin: true },
  { command: "!joinda", description: "Join Dragon Arena for the guild.", example: "!joinda", group: "General", admin: true },
  { command: "!leaveda", description: "Leave Dragon Arena.", example: "!leaveda", group: "General", admin: true },

  { command: "!adminbal [player]", description: "Check another player's resource balance.", example: "!adminbal Shark", group: "Balance", admin: true },
  { command: "!adminbal", description: "Check the Guild Bank's resource balance.", example: "!adminbal", group: "Balance", admin: true },
  { command: "!adminbag", description: "Check the resource balance stored in the Guild Bank's bags.", example: "!adminbag", group: "Balance", admin: true },
  { command: "!setbal [player] [type] [amount]", description: "Manually set one resource balance for a player.", example: "!setbal Shark food 100M", group: "Balance", admin: true },
  { command: "!setrsslimit [type] [amount]", description: "Set a resource reserve that the Guild Bank will not send below.", example: "!setrsslimit gold 100M", group: "Balance", admin: true },

  { command: "!admin[type] [player] [amount]", description: "Administratively send one resource type to a player.", example: "!adminfood Shark 5M", group: "Resources", admin: true },
  { command: "!adminrss [F] [S] [W] [O] [G] [player]", description: "Administratively send all five resource types to a player.", example: "!adminrss 0 5M 5M 5M 5M Shark", group: "Resources", admin: true },
];

export const planPrices = [
  { accounts: 1, monthly: 150, quarterly: 400, yearly: 1500 },
  { accounts: 2, monthly: 280, quarterly: 750, yearly: 2800 },
  { accounts: 3, monthly: 400, quarterly: 1100, yearly: 4000 },
  { accounts: 4, monthly: 500, quarterly: 1400, yearly: 5000 },
  { accounts: 5, monthly: 600, quarterly: 1700, yearly: 6000 },
];
