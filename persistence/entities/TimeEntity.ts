import { EntitySchema } from "typeorm"
import { sharedEntityBaseColumns } from "./sharedEntityBase";

// Pure data interface for persistence - no domain logic
export interface ITimeEntity {
    id: number;
    season: number;
    week: number;
    day: number;
    hour: number;
}

export const TimeEntity = new EntitySchema<ITimeEntity>({
    name: "time",
    columns: {
        ...sharedEntityBaseColumns,
        season: {
            type: "int"
        },
        week: {
            type: "int"
        },
        day: {
            type: "int"
        },
        hour: {
            type: "int"
        }
    }
})