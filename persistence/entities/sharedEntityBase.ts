import { EntitySchemaColumnOptions } from "typeorm"

export const sharedEntityBaseColumns = {
    id: {
        type: Number,
        primary: true,
        generated: true,
    } as EntitySchemaColumnOptions,
    createdAt: {
        name: "created_at",
        type: "timestamp with time zone",
        createDate: true,
        select: false,
    } as EntitySchemaColumnOptions,
    updatedAt: {
        name: "updated_at",
        type: "timestamp with time zone",
        updateDate: true,
        select: false,
    } as EntitySchemaColumnOptions,
}