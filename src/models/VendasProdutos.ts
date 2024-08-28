import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Usuario } from "./Usuario";
import { Cliente } from "./Cliente";
import { Produto } from "./Produto";
import { Vendas } from "./Vendas";

@Table({
  tableName: VendasProdutos.VENDASPRODUTOS_TABLE_NAME,
})
export class VendasProdutos extends Model {
  public static VENDASPRODUTOS_TABLE_NAME = "vendasProdutos" as string;
  //public static VENDASPRODUTOS_ID = "id" as string;
  public static VENDASPRODUTOS_PRECO_VENDA = "preco_venda" as string;
  public static VENDASPRODUTOS_QUANTIDADE = "quantidade" as string;

  // @Column({
  //   primaryKey: true,
  //   autoIncrement: true,
  //   allowNull: false,
  //   field: VendasProdutos.VENDASPRODUTOS_ID,
  // })
  // id!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    field: VendasProdutos.VENDASPRODUTOS_PRECO_VENDA,
  })
  preco_venda!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    field: VendasProdutos.VENDASPRODUTOS_QUANTIDADE,
  })
  quantidade!: number;

  @ForeignKey(() => Vendas)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  vendas_id!: number;

  @BelongsTo(() => Vendas, {
    foreignKey: "vendas_id",
    targetKey: "id",
  })
  vendas!: Vendas;

  @ForeignKey(() => Produto)
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    allowNull: false,
  })
  produto_id!: number;

  @BelongsTo(() => Produto, {
    foreignKey: "produto_id",
    targetKey: "id",
  })
  produto!: Produto;

  // @BelongsToMany(() => Vendas, {
  //   through: "Vendas_VendasProdutos",
  // })
  // vendas!: Vendas;
}
