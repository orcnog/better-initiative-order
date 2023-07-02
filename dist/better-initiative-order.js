import { libWrapper } from './shim.js';
import { registerBIOSettings } from "./bio-settings.js";
import { _onRenderSettingsConfig } from "./bio-settings.js";

let activeSortFunctions = [
    // First, sort by initiative number (this is from the FVTT default sort function)
    function (a,b) {
        const ia = Number.isNumeric(a.initiative) ? a.initiative : bioSortFunctions.reverse ? 9999 : -9999;
        const ib = Number.isNumeric(b.initiative) ? b.initiative : bioSortFunctions.reverse ? 9999 : -9999;
        return ib - ia;
    }
];
let bioSortFunctions = {
    // Sort player-owned combatants ahead of non player-owned
    "otw": {
        sortFunction: function (a, b) {
            const oa = a.hasPlayerOwner ? 1 : -1;
            const ob = b.hasPlayerOwner ? 1 : -1;
            return ob - oa;
        },
    },

    // Sort PC combatants ahead of NPC
    "pcw": {
        sortFunction: function (a, b) {
            const at = a.actor.type === 'character' ? 1 : -1;
            const bt = b.actor.type === 'character' ? 1 : -1;
            return bt - at;
        },
    },

    // Sort friendlies ahead of neutrals ahead of hostiles. Limit to NPCs if 'pcw' setting is active.
    "fnw": {
        sortFunction: function (a, b) {
            if ( !bioSortFunctions.pcw?.active || (a.actor.type === 'npc' && b.actor.type === 'npc') ) {
                const ha = a.token.data.disposition;
                const hb = b.token.data.disposition;
                return hb - ha;
            } else {
                return 0;
            }
        },
    },

    // Sort higher initiative bonus wins
    "ibw": {
        sortFunction: function (a, b) {
            const ba = a.actor.data.data.attributes.init.bonus;
            const bb = b.actor.data.data.attributes.init.bonus;
            return bb - ba;
        },
    },

    // Sort higher raw dex score wins
    "dsw": {
        sortFunction: function (a, b) {
            const da = a.actor.data.data.abilities.dex.value;
            const db = b.actor.data.data.abilities.dex.value;
            return db - da;
        },
    },
}

Hooks.on("renderSettingsConfig", (app, html, data) => {
    _onRenderSettingsConfig(app, html, data);
});

Hooks.on('init', setup);

async function setup() {
    await registerBIOSettings();
    if (!!game.settings.get("better-initiative-order","ownedTokenWins")) {
        bioSortFunctions.otw.active = true;
        bioSortFunctions.otw.priority = game.settings.get("better-initiative-order","ownedTokenWinsPriority");
    }
    if (!!game.settings.get("better-initiative-order","pcWins")) {
        bioSortFunctions.pcw.active = true;
        bioSortFunctions.pcw.priority = game.settings.get("better-initiative-order","pcWinsPriority");
    }
    if (!!game.settings.get("better-initiative-order","friendlyNpcWins")) {
        bioSortFunctions.fnw.active = true;
        bioSortFunctions.fnw.priority = game.settings.get("better-initiative-order","friendlyNpcWinsPriority");
    }
    if (!!game.settings.get("better-initiative-order","initBonusWins")) {
        bioSortFunctions.ibw.active = true;
        bioSortFunctions.ibw.priority = game.settings.get("better-initiative-order","initBonusWinsPriority");
    }
    if (!!game.settings.get("better-initiative-order","dexScoreWins")) {
        bioSortFunctions.dsw.active = true;
        bioSortFunctions.dsw.priority = game.settings.get("better-initiative-order","dexScoreWinsPriority");
    }
    bioSortFunctions.reverse = !!game.settings.get("better-initiative-order","reverseInitiativeOrder");

    Object.keys(bioSortFunctions).forEach((k) => {
        const obj = bioSortFunctions[k];
        if (obj.active) activeSortFunctions[obj.priority] = obj.sortFunction;
    });
    // activeSortFunctions.sort((a,b) => {return a.priority > b.priority});

    libWrapper.register('better-initiative-order', 'Combat.prototype._sortCombatants', sortFunction);
}

/**
 *  Initiative order will now handle and sort initiative ties in this order:
 *  1. a player-owned combatant beats a non-player owned combatant
 *  2. a PC beats an NPC (e.g. combatant of a main player beats that of a familiar)
 *  3. friendly combatants win out over hostile combatants
 *  4. the combatant actor with the higher initiative bonus wins
 *  5. the combatant actor with the higher raw dexterity score wins
 *  6. If a tie still remains, fallback to the FVTT default: sort by unique combatant id.
 */
 function sortFunction(wrapped, a,b) {
    let result;
    activeSortFunctions.some((fn, i) => {
        result = fn(a,b);
        return result !== 0; // break loop 
    });

    if (bioSortFunctions.reverse) result = (result * -1);
    if (result !== 0) return result;

    // Default FVTT sorting rule fallback
    return a.id > b.id ? 1 : -1;
};