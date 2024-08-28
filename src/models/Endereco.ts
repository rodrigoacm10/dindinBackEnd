import {
  Model,
  Table,
  Column,
  DataType,
  BelongsTo,
  ForeignKey,
} from "sequelize-typescript";

import { Fornecedor } from "./Fornecedor";

@Table({
  tableName: Endereco.ENDERECO_TABLE_NAME,
})
export class Endereco extends Model {
  public static ENDERECO_TABLE_NAME = "endereco" as string;
  public static ENDERECO_ID = "id" as string;
  public static ENDERECO_CEP = "cep" as string;
  public static ENDERECO_RUA = "rua" as string;
  public static ENDERECO_NUMERO = "numero" as string;
  public static ENDERECO_COMPLEMENTO = "complemento" as string;
  public static ENDERECO_BAIRRO = "bairro" as string;
  public static ENDERECO_CIDADE = "cidade" as string;
  public static ENDERECO_UF = "uf" as string;
  public static ENDERECO_OBSERVACAO = "observacao" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: Endereco.ENDERECO_ID,
    type: DataType.INTEGER,
  })
  id!: number;

  @Column({
    type: DataType.STRING(9),
    allowNull: true,
    field: Endereco.ENDERECO_CEP,
  })
  cep!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Endereco.ENDERECO_RUA,
  })
  rua!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: Endereco.ENDERECO_NUMERO,
  })
  numero!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Endereco.ENDERECO_COMPLEMENTO,
  })
  complemento?: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Endereco.ENDERECO_BAIRRO,
  })
  bairro!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Endereco.ENDERECO_CIDADE,
  })
  cidade!: string;

  @Column({
    type: DataType.STRING(2),
    allowNull: true,
    field: Endereco.ENDERECO_UF,
  })
  uf!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Endereco.ENDERECO_OBSERVACAO,
  })
  observacao!: string;

  @ForeignKey(() => Fornecedor)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  fornecedor_id!: number;

  @BelongsTo(() => Fornecedor, {
    foreignKey: "fornecedor_id",
    targetKey: "id",
  })
  fornecedor!: Fornecedor;
}
