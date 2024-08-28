import { UUIDV4 } from "sequelize";
import {
  Model,
  Table,
  Column,
  DataType,
  HasMany,
  IsIn,
  HasOne,
} from "sequelize-typescript";
import { CategoriaDespesa } from "./CategoriaDespesa";
import { CategoriaReceita } from "./CategoriaReceita";
import {
  BD_USUARIO_CATEGORIA_CONTA,
  BD_USUARIO_NIVEL_ACESSO,
} from "../utils/Constantes";

@Table({
  tableName: Usuario.USUARIO_TABLE_NAME,
})
export class Usuario extends Model {
  public static USUARIO_TABLE_NAME = "usuario" as string;
  public static USUARIO_ID = "usuario_id" as string;
  public static USUARIO_NOME = "nome" as string;
  public static USUARIO_EMAIL = "email" as string;
  public static USUARIO_SENHA = "senha" as string;
  public static USUARIO_ANEXO = "anexo" as string;
  public static USUARIO_CATEGORIA_CONTA = "categoria_conta" as string;
  public static USUARIO_NIVEL_ACESSO = "nivel_acesso" as string;

  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: UUIDV4,
    field: Usuario.USUARIO_ID,
    onDelete: "CASCADE",
  })
  usuario_id!: string;

  @Column({
    type: DataType.STRING(150),
    field: Usuario.USUARIO_NOME,
    allowNull: false,
  })
  nome!: string;

  @Column({
    type: DataType.STRING(100),
    field: Usuario.USUARIO_EMAIL,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  })
  email!: string;

  @Column({
    type: DataType.STRING(100),
    field: Usuario.USUARIO_SENHA,
    allowNull: false,
  })
  senha!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Usuario.USUARIO_ANEXO,
  })
  anexo!: string;

  @Column({
    type: DataType.STRING(20),
    field: Usuario.USUARIO_CATEGORIA_CONTA,
    allowNull: true,
    validate: {
      isIn: [BD_USUARIO_CATEGORIA_CONTA],
    },
    set(value: string) {
      this.setDataValue(
        Usuario.USUARIO_CATEGORIA_CONTA,
        value == null ? null : value.toLocaleUpperCase()
      );
    },
  })
  categoria_conta!: string;

  @Column({
    type: DataType.STRING(20),
    field: Usuario.USUARIO_NIVEL_ACESSO,
    allowNull: false,
    validate: {
      isIn: [BD_USUARIO_NIVEL_ACESSO],
    },
    set(value: string) {
      this.setDataValue(
        Usuario.USUARIO_NIVEL_ACESSO,
        value ? value.toLocaleUpperCase() : BD_USUARIO_NIVEL_ACESSO[0]
      );
    },
  })
  nivel_acesso!: string;

  @HasMany(() => CategoriaDespesa)
  categoriasDespesa!: CategoriaDespesa[];

  @HasMany(() => CategoriaReceita)
  categoriasReceita!: CategoriaReceita[];
}
