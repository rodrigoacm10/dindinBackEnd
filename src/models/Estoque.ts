import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Produto } from "./Produto";
import { Fornecedor } from "./Fornecedor";

@Table({
  tableName: Estoque.ESTOQUE_TABLE_NAME,
})
export class Estoque extends Model {
  public static ESTOQUE_TABLE_NAME = "estoque" as string;
  public static ESTOQUE_ID = "id" as string;
  public static ESTOQUE_DATA = "data" as string;
  public static ESTOQUE_TIPO_PAGAMENTO = "tipo_pagamento" as string;
  public static ESTOQUE_VALOR_ENTRADA = "valor_entrada" as string;
  public static ESTOQUE_PARCELAS = "parcelas" as string;
  public static ESTOQUE_VALOR_PARCELAS = "valor_parcelas" as string;
  public static ESTOQUE_QUANTIDADE = "quantidade" as string;
  public static ESTOQUE_PRECO_TOTAL = "preco_total" as string;
  public static ESTOQUE_ENTRADA = "entrada" as string;
  public static ESTOQUE_ANEXO = "anexo" as string;
  public static ESTOQUE_RECEBIDO = "recebido" as string;
  public static ESTOQUE_DESCRICAO = "descricao" as string;
  public static ESTOQUE_NOTA_FISCAL = "nota_fiscal" as string;
  public static ESTOQUE_CANCELADO = "cancelado" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: Estoque.ESTOQUE_ID,
  })
  id!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: Estoque.ESTOQUE_DATA,
  })
  data!: Date;

  @Column({
    type: DataType.STRING(50),
    allowNull: false,
    field: Estoque.ESTOQUE_TIPO_PAGAMENTO,
  })
  tipo_pagamento!: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: Estoque.ESTOQUE_VALOR_ENTRADA,
  })
  valor_entrada!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: Estoque.ESTOQUE_PARCELAS,
  })
  parcelas!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: Estoque.ESTOQUE_VALOR_PARCELAS,
  })
  valor_parcelas!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    field: Estoque.ESTOQUE_QUANTIDADE,
  })
  quantidade!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    field: Estoque.ESTOQUE_PRECO_TOTAL,
  })
  preco_total!: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    field: Estoque.ESTOQUE_ENTRADA,
  })
  entrada!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: Estoque.ESTOQUE_RECEBIDO,
  })
  recebido!: boolean;

  @Column({
    type: DataType.STRING(250),
    allowNull: true,
    field: Estoque.ESTOQUE_DESCRICAO,
  })
  descricao!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Estoque.ESTOQUE_ANEXO,
  })
  anexo!: string;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Estoque.ESTOQUE_NOTA_FISCAL,
  })
  nota_fiscal!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: Estoque.ESTOQUE_CANCELADO,
  })
  cancelado!: boolean;

  @ForeignKey(() => Produto)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  produto_id!: number;

  @BelongsTo(() => Produto, {
    foreignKey: "produto_id",
    targetKey: "id",
  })
  produto!: Produto;

  @ForeignKey(() => Fornecedor)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  fornecedor_id!: number;

  @BelongsTo(() => Fornecedor, {
    foreignKey: "fornecedor_id",
    targetKey: "id",
  })
  fornecedor!: Fornecedor;
}
