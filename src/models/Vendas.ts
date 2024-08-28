import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
  HasMany
} from "sequelize-typescript";
import { Usuario } from "./Usuario";
import { Cliente } from "./Cliente";
import { Produto } from "./Produto";
import { VendasProdutos } from "./VendasProdutos";

@Table({
  tableName: Vendas.VENDAS_TABLE_NAME,
})
export class Vendas extends Model {
  public static VENDAS_TABLE_NAME = "vendas" as string;
  public static VENDAS_ID = "id" as string;
  public static VENDAS_PRECO_TOTAL = "preco_total" as string;
  public static VENDAS_DATA = "data" as string;
  public static VENDAS_TIPO_PAGAMENTO = "tipo_pagamento" as string;
  public static VENDAS_VALOR_ENTRADA = "valor_entrada" as string;
  public static VENDAS_PARCELAS = "parcelas" as string;
  public static VENDAS_VALOR_PARCELAS = "valor_parcelas" as string;
  public static VENDAS_OBSERVACAO = "observacao" as string;
  public static VENDAS_ANEXO = "anexo" as string;
  public static VENDAS_CANCELADO = "cancelado" as string;
  public static VENDAS_ENTREGUE = "entregue" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: Vendas.VENDAS_ID,
  })
  id!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    field: Vendas.VENDAS_PRECO_TOTAL,
  })
  preco_total!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    field: Vendas.VENDAS_DATA,
  })
  data!: Date;

  @Column({
    type: DataType.STRING(45),
    allowNull: false,
    field: Vendas.VENDAS_TIPO_PAGAMENTO,
  })
  tipo_pagamento!: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: Vendas.VENDAS_VALOR_ENTRADA,
  })
  valor_entrada!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: Vendas.VENDAS_PARCELAS,
  })
  parcelas!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    defaultValue: 0,
    field: Vendas.VENDAS_VALOR_PARCELAS,
  })
  valor_parcelas!: number;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: Vendas.VENDAS_OBSERVACAO,
  })
  observacao!: string;

  @Column({
    type: DataType.STRING(200),
    allowNull: true,
    field: Vendas.VENDAS_ANEXO,
  })
  anexo!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: Vendas.VENDAS_CANCELADO,
  })
  cancelado!: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    field: Vendas.VENDAS_ENTREGUE,
  })
  entregue!: boolean;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  usuario_id!: string;

  @BelongsTo(() => Usuario)
  usuario!: Usuario;

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  cliente_id!: number;

  @BelongsTo(() => Cliente, {
    foreignKey: "cliente_id",
    targetKey: "id",
  })
  cliente!: Cliente;

  @HasMany(() => VendasProdutos)
  vendasProdutos!: VendasProdutos[];
  // @BelongsToMany(() => VendasProdutos, {
  //   through: "Vendas_VendasProdutos",
  // })
  // vendas_produtos!: VendasProdutos;
}
