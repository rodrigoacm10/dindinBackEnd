import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Usuario } from "./Usuario";

@Table({
  tableName: CategoriaDespesa.CATEGORIA_DESPESA_TABLE_NAME,
})
export class CategoriaDespesa extends Model {
  public static CATEGORIA_DESPESA_TABLE_NAME = "categoria_despesa" as string;
  public static CATEGORIA_DESPESA_ID = "categoria_despesa_id" as string;
  public static CATEGORIA_DESPESA_NOME = "nome" as string;

  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
    field: CategoriaDespesa.CATEGORIA_DESPESA_ID,
  })
  categoria_despesa_id!: number;

  @Column({
    type: DataType.STRING(45),
    field: CategoriaDespesa.CATEGORIA_DESPESA_NOME,
    allowNull: false,
  })
  nome!: string;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    field: "usuario_id",
    allowNull: true,
  })
  usuario_id!: string | null;

  @BelongsTo(() => Usuario, {
    foreignKey: "usuario_id",
    targetKey: "usuario_id",
  })
  usuario!: Usuario | null;
}
