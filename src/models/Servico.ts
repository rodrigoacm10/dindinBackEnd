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
  tableName: Servico.SERVICO_TABLE_NAME,
})
export class Servico extends Model {
  public static SERVICO_TABLE_NAME = "servico" as string;
  public static SERVICO_ID = "id" as string;
  public static SERVICO_NOME = "nome" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: Servico.SERVICO_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: Servico.SERVICO_NOME,
  })
  nome!: string;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  usuario_id!: string;

  @BelongsTo(() => Usuario)
  usuario!: Usuario;
}
