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
  tableName: UsuarioCNPJ.USUARIO_CNPJ_TABLE_NAME,
})
export class UsuarioCNPJ extends Model {
  public static USUARIO_CNPJ_TABLE_NAME = "usuario_cnpj" as string;
  public static USUARIO_CNPJ = "cnpj" as string;

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
    type: DataType.STRING(14),
    allowNull: false,
    field: UsuarioCNPJ.USUARIO_CNPJ,
    validate: {
      len: [14, 14],
      isNumeric: true,
    },
    set(value: string) {
      var numberRegexG = /\d$/g;
      value.match(numberRegexG)?.join("");

      this.setDataValue(UsuarioCNPJ.USUARIO_CNPJ, value);
    },
  })
  cnpj!: string;
}
