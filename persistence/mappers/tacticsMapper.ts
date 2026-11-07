import Player from "../../domainCore/Player";
import Tactics, { Formation, LineupSlot, MasterTactic, Position } from "../../domainCore/Tactics";
import { TacticsEntityData } from "../entities/TacticsEntity";
import { TacticsLineupSlotEntityData } from "../entities/TacticsLineupSlotEntity";

const sortLineupSlotsByIndex = (lineupSlots: TacticsLineupSlotEntityData[]): TacticsLineupSlotEntityData[] => (
    [...lineupSlots].sort((left, right) => left.slotIndex - right.slotIndex)
);

const mapLineupSlotsFromEntity = (lineupSlots: TacticsLineupSlotEntityData[] | undefined): LineupSlot[] => {
    return sortLineupSlotsByIndex(lineupSlots ?? []).map((slotEntity) => ({
        position: slotEntity.position as Position,
        player: slotEntity.playerId !== undefined && slotEntity.playerId !== null
            ? ({ id: slotEntity.playerId } as Player)
            : null,
    }));
};

export const fromTacticsEntity = (entity: TacticsEntityData): Tactics => {
    return Tactics.restoreFromPersistence({
        id: entity.id,
        matchId: entity.matchId ?? 0,
        side: (entity.side as any) ?? "home",
        formation: entity.formation as Formation,
        masterTactic: entity.masterTactic as MasterTactic,
        locked: entity.locked ?? false,
        lineup: mapLineupSlotsFromEntity(entity.lineupSlots as TacticsLineupSlotEntityData[] | undefined),
    });
};

export const toTacticsEntityData = (tactics: Tactics): TacticsEntityData => {
    return {
        id: tactics.id,
        matchId: tactics.matchId,
        side: tactics.side,
        formation: tactics.formation,
        masterTactic: tactics.masterTactic,
        locked: tactics.locked,
        lineupSlots: tactics.lineup.map((slot, index): TacticsLineupSlotEntityData => ({
            tacticsId: tactics.id ?? 0,
            slotIndex: index,
            position: slot.position,
            playerId: slot.player?.id ?? null,
        })),
    };
};