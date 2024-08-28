import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  PrimaryKey,
  BelongsTo,
} from "sequelize-typescript";
import { Usuario } from "./Usuario";

@Table({
  tableName: UsuarioCPF.USUARIO_CPF_TABLE_NAME,
})
export class UsuarioCPF extends Model {
  public static USUARIO_CPF_TABLE_NAME = "usuario_cpf" as string;
  public static USUARIO_CPF = "cpf" as string;

  @PrimaryKey
  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: Usuario.USUARIO_ID,
  })
  usuario_id!: string;

  @BelongsTo(() => Usuario)
  usuario!: Usuario;

  @Column({
    type: DataType.STRING(11),
    allowNull: false,
    field: UsuarioCPF.USUARIO_CPF,
    validate: {
      len: [11, 11],
      isNumeric: true,
    },
    set(value: string) {
      var numberRegexG = /\d$/g;
      //value.match(numberRegexG)?.join("");
      value = value.replace(/\D/g, "");

      this.setDataValue(UsuarioCPF.USUARIO_CPF, value);
    },
  })
  cpf!: string;
}
