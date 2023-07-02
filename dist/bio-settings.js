const debouncedReload = debounce(() => window.location.reload(), 100);

export function registerBIOSettings() {
    game.settings.register("better-initiative-order", "ownedTokenWins", {
        name: "Player-Owned Tie Breaker",
        hint: "Combatants with player owners win in initiative tie breakers.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "ownedTokenWinsPriority", {
        name: "Player-Owned Priority",
        hint: "The order in which this tie breaker is evaluated. A lower number means it will try to break the tie first with this rule before trying the next tie breaker rule.",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 5,
            step: 1
        },
        default: 1,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "pcWins", {
        name: "Character vs. NPC Tie Breaker",
        hint: "Combatants with actor.type of 'character' beat combatants with actor.type of 'npc' in initiative tie breakers.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "pcWinsPriority", {
        name: "Character vs. NPC Priority",
        hint: "The order in which this tie breaker is evaluated. A lower number means it will try to break the tie first with this rule before trying the next tie breaker rule.",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 5,
            step: 1
        },
        default: 2,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "friendlyNpcWins", {
        name: "Disposition Tie Breaker",
        hint: "Combatants with Friendly dispositions beat Neautral dispositions, which beat Hostile dispositions in initiative tie breakers.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "friendlyNpcWinsPriority", {
        name: "Disposition Priority",
        hint: "The order in which this tie breaker is evaluated. A lower number means it will try to break the tie first with this rule before trying the next tie breaker rule.",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 5,
            step: 1
        },
        default: 3,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "initBonusWins", {
        name: "Initiative Bonus Tie Breaker",
        hint: "PC combatant with the higher initiative bonus wins in initiative tie breakers.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "initBonusWinsPriority", {
        name: "Initiative Bonus Priority",
        hint: "The order in which this tie breaker is evaluated. A lower number means it will try to break the tie first with this rule before trying the next tie breaker rule.",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 5,
            step: 1
        },
        default: 4,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "dexScoreWins", {
        name: "Dexterity Score Tie Breaker",
        hint: "PC combatant with the higher raw Dexterity score wins in initiative tie breakers.",
        scope: "world",
        config: true,
        type: Boolean,
        default: true,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "dexScoreWinsPriority", {
        name: "Dexterity Score Priority",
        hint: "The order in which this tie breaker is evaluated. A lower number means it will try to break the tie first with this rule before trying the next tie breaker rule.",
        scope: "world",
        config: true,
        type: Number,
        range: {
            min: 1,
            max: 5,
            step: 1
        },
        default: 5,
        onChange: debouncedReload
    });
    game.settings.register("better-initiative-order", "reverseInitiativeOrder", {
        name: "Reverse Initiative Order",
        hint: "Reverse the initiative order, lowest first and highest last.",
        scope: "world",
        config: true,
        type: Boolean,
        default: false,
        onChange: debouncedReload
    });
}

export function _onRenderSettingsConfig(settingsConfig, html, user) {
    /**
     * Handle the "renderSettingsConfig" hook.
     * This is fired when Foundry's settings window is opened.
     * Enable / disable interaction with various settings, depending on whether "Notify Typing" is enabled.
     */
    const formGroups = html[0].querySelectorAll('div.form-group');

    const bioBooleanGroups = [...formGroups].filter(fg => {
        return !!fg.querySelector('input[name^="better-initiative-order."]') && !fg.querySelector('input[name$="Priority"]');
    });
    const bioPriorityGroups = [...formGroups].filter(fg => {
        return !!fg.querySelector('input[name^="better-initiative-order."]') && !!fg.querySelector('input[name$="Priority"]');
    });
    const bioActiveGroups = [...bioBooleanGroups].filter(fg => {
        return !!fg.querySelector('input:checked');
    });
    // Add a class to activated BIO configs (in order to hide "Priority" settings when sort functions are not marked active, via CSS).
    bioActiveGroups.forEach(fg => {
        fg.classList.add('active');
    });
    bioBooleanGroups.forEach(fg => {
        fg.classList.add('bio-checkbox');
        fg.addEventListener("change", (event) => {
            if (event.target.checked) {
                fg.classList.add('active');
            } else {
                fg.classList.remove('active');
            }
        })
    });
    bioPriorityGroups.forEach(fg => {
        fg.addEventListener("change", (event) => {
            if (event.target.checked) {
                fg.classList.add('active');
            } else {
                fg.classList.remove('active');
            }
        })
    });
}
