// Abstracts all interactions with the game server and individual games.

import { Key } from "react";
import { GameSettings, GameInfo, GameRecord, GameEvent, toGameInfo } from "./types";
import { createHostedGame, startHostedGame } from "../gameServer/gameServer"
import { settings } from "../state/settings";

type ObjectGroup<T> = {
    key: Key
    items: T[]
}

let gameDatabase = new Map<string, GameRecord>();

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

function collateGameInfo(gameEventGroup: ObjectGroup<GameEvent>): GameInfo {
    const reverse = true;
    return orderBy(gameEventGroup.items, e => e.timestamp, reverse)[0].gameInfo;
}

export function listGames(): GameInfo[] {
    // const gameMessages = await getGameMessages();
    // const gameEvents = []; // TODO
    // return groupBy(gameEvents, e => e.gameInfo.id)
    //     .map(gp => collateGameInfo(gp));
    return Array.from(gameDatabase.values(), toGameInfo);
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

    // HACK: for now, get the created game and add it to the list we return from listGames()
    // TODO: fix separation of responsibilities
    const createdGameHack = createHostedGame(gameSettings, host)
    gameDatabase.set(createdGameHack.id, createdGameHack)
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
