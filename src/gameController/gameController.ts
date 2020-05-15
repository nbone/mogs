// Abstracts all interactions with the game server and individual games.

import { Key } from "react";
import { GameSettings, GameInfo } from "./types";
import { createHostedGame, startHostedGame } from "../gameServer/gameServer"
import { settings } from "../state/settings";
import { getGameMessages, MessageType, RichMessage, subscribeMessageCallback } from "../state/messageStore";

type ObjectGroup<T> = {
    key: Key
    items: T[]
}

// Maintain local in-memory database of all the games, from the published message history
let gameDatabase = new Map<string, GameInfo>();
getGameMessages().then(
    gameMessages => {
        const gameInfoMessages = gameMessages.filter(m => m.type == MessageType.GameInfo);
        const reverse = true;
        orderBy(gameInfoMessages, m => m.when, reverse).forEach(processMessage);
    }
).then(
    () => {
        subscribeMessageCallback(processMessage);
    }
)

function processMessage(message: RichMessage) {
    if (message.type == MessageType.GameInfo) {
        const gameInfo: GameInfo = message.body;
        gameDatabase.set(gameInfo.id, gameInfo);
    }
}

function groupBy<T>(sequence: T[], propertySelector: (obj: T) => Key): ObjectGroup<T>[] {
    let groups = new Map<Key, object[]>();
    sequence.reduce((groups, item) => {
        let key = propertySelector(item);
        if (!groups[key]) {
            groups[key] = [];
        }
        groups[key].push(item);
        return groups;
    });
    return Array.from(groups.keys(), key => {
        return {
            key: key,
            items: groups[key],
        };
    });
}

function orderBy<T>(sequence: T[], propertySelector: (obj: T) => Key, reverse: boolean=false): T[] {
    return sequence.sort((a, b) => {
        const [pa, pb] = [propertySelector(a), propertySelector(b)];
        const ltReturn = reverse ? 1 : -1;
        return pa < pb
            ? ltReturn
            : pa > pb
                ? -ltReturn
                : 0;
    });
}

function collateGameInfo(gameEventGroup: ObjectGroup<RichMessage>): GameInfo {
    const reverse = true;
    return orderBy(gameEventGroup.items, e => e.when, reverse)[0].body;
}

export function listGames(): GameInfo[] {
    console.log(Array.from(gameDatabase.values()))
    return Array.from(gameDatabase.values())
}

export function createGame(gameSettings: GameSettings) {
    // TODO: get ALL player info from settings, and handle error if missing
    const playerName = settings.getUserName() || ''
    const publicKey = new Uint8Array()
    const host = {
        id: 'TODO',
        name: playerName,
        isHost: true,
        publicKey: publicKey
    }

    createHostedGame(gameSettings, host)
}

export function joinGame(gameId: string) {
    // 1. fetch game data from store
    // 2. validate that join is OK
    // 3. update game entity
    // 4. publish join event
}

export function startGame(gameId: string) {
    // ONLY for self-hosted games (verify that current player is the host)
    startHostedGame(gameId)
}

// TODO:
// 1. function so app knows whether we're currently in a game
// 2. function to render the game view

export function getCurrentGameInfo(): GameInfo | undefined {
    // HACK: for now using local game database instead of from server
    // TODO: use player ID instead of name
    // ASSUME: can only be in one game at a time, so return first match
    const playerName = settings.getUserName() || '';
    return listGames().find(g => g.players.find(p => p.name == playerName));
}

export function renderGameView(gameId: string) {
    
}
