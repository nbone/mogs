// Abstracts all interactions with the game server and individual games.

import { GameSettings, GameInfo, GameStatus, GamePlayer } from "./types";
import { Key } from "react";

type ObjectGroup<T> = {
    key: Key
    items: T[]
}

export enum GameEventType {
    Create,
    Join,
    Start,
    Finish,
    Abort,
    Message,
}

export class GameEvent {
    constructor(
        public id: string,
        public type: GameEventType,
        public timestamp: number,
        public gameInfo: GameInfo,
        public details: object | undefined,
    ){}
}

class GameRecord {
    constructor (
        public id: string,
        public settings: GameSettings,
        public status: GameStatus,
        public players: GamePlayer[],
        public events: object[],
        public gameState: object,
    ){}
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

function toGameInfo(gameRecord: GameRecord): GameInfo {
    return new GameInfo(
        gameRecord.id,
        gameRecord.settings,
        gameRecord.status,
        gameRecord.players,
    )
}

export function listGames(): GameInfo[] {
    // const gameMessages = await getGameMessages();
    // const gameEvents = []; // TODO
    // return groupBy(gameEvents, e => e.gameInfo.id)
    //     .map(gp => collateGameInfo(gp));
    return Array.from(gameDatabase.values(), toGameInfo);
}

export function createGame(gameSettings: GameSettings) {
    // maybe move "server" logic to other module, but...
    // 1. create new game entity
    // 2. insert into game data store
    // 3. publish create event
}

export function joinGame(gameId: string) {
    // 1. fetch game data from store
    // 2. validate that join is OK
    // 3. update game entity
    // 4. publish join event
}
