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
  tableName: Cliente.CLIENTE_TABLE_NAME,
})
export class Cliente extends Model {
  public static CLIENTE_TABLE_NAME = "cliente" as string;
  public static CLIENTE_ID = "id" as string;
  public static CLIENTE_NOME = "nome" as string;
  public static CLIENTE_TELEFONE = "telefone" as string;
  public static CLIENTE_EMAIL = "email" as string;
  public static CLIENTE_WHATSAPP = "whatsapp" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: Cliente.CLIENTE_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: Cliente.CLIENTE_NOME,
  })
  nome!: string;

  @Column({
    type: DataType.STRING(20),
    allowNull: true,
    field: Cliente.CLIENTE_TELEFONE,
  })
  telefone!: string;

  @Column({
    type: DataType.STRING(100),
    field: Cliente.CLIENTE_EMAIL,
    allowNull: true,
    validate: { isEmail: true },
  })
  email!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: Cliente.CLIENTE_WHATSAPP,
  })
  whatsapp!: boolean;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  usuario_id!: string;

  @BelongsTo(() => Usuario)
  usuario!: Usuario;
}
