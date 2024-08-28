import {
  Model,
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";

import { Usuario } from "./Usuario";
@Table({
  tableName: Fornecedor.FORNECEDOR_TABLE_NAME,
})
export class Fornecedor extends Model {
  public static FORNECEDOR_TABLE_NAME = "fornecedor" as string;
  public static FORNECEDOR_ID = "id" as string;
  public static FORNECEDOR_PESSOA_FISICA = "pessoa_fisica" as string;
  public static FORNECEDOR_RAZAO_SOCIAL = "razao_social" as string;
  public static FORNECEDOR_NOME_FANTASIA = "nome_fantasia" as string;
  public static FORNECEDOR_CNPJ = "cnpj" as string;
  public static FORNECEDOR_NOME = "nome" as string;
  public static FORNECEDOR_CPF = "cpf" as string;
  public static FORNECEDOR_DATA_NASC = "data_nascimento" as string;
  public static FORNECEDOR_TELEFONE = "telefone" as string;
  public static FORNECEDOR_EMAIL = "email" as string;
  public static FORNECEDOR_NOME_CONTATO = "nome_contato" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: Fornecedor.FORNECEDOR_ID,
  })
  id!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: Fornecedor.FORNECEDOR_PESSOA_FISICA,
  })
  pessoa_fisica!: boolean;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Fornecedor.FORNECEDOR_NOME_FANTASIA,
  })
  nome_fantasia!: string;

  @Column({
    type: DataType.STRING(100),
    field: Fornecedor.FORNECEDOR_RAZAO_SOCIAL,
    allowNull: true,
  })
  razao_social!: string | null;

  @Column({
    type: DataType.STRING(18),
    allowNull: true,
    field: Fornecedor.FORNECEDOR_CNPJ,
  })
  cnpj!: string | null;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Fornecedor.FORNECEDOR_NOME,
  })
  nome!: string | null;

  @Column({
    type: DataType.STRING(11),
    allowNull: true,
    field: Fornecedor.FORNECEDOR_CPF,
  })
  cpf!: string | null;

  @Column({
    type: DataType.DATEONLY,
    allowNull: true,
    field: Fornecedor.FORNECEDOR_DATA_NASC,
  })
  data_nascimento!: Date | null;

  @Column({
    type: DataType.STRING(100),
    field: Fornecedor.FORNECEDOR_EMAIL,
    allowNull: true,
    validate: { isEmail: true },
  })
  email!: string | null;

  @Column({
    type: DataType.STRING(14),
    allowNull: true,
    field: Fornecedor.FORNECEDOR_TELEFONE,
  })
  telefone!: string | null;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: Fornecedor.FORNECEDOR_NOME_CONTATO,
  })
  nome_contato!: string | null;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: false,
    field: "usuario_id",
  })
  usuario_id!: string;

  @BelongsTo(() => Usuario, {
    foreignKey: "usuario_id",
    targetKey: "usuario_id",
  })
  usuario!: Usuario;
}
