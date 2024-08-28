import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Usuario } from "./Usuario";
import { CategoriaProduto } from "./CategoriaProduto";
import { Fornecedor } from "./Fornecedor";
import { Marca } from "./Marca";

@Table({
  tableName: Produto.PRODUTO_TABLE_NAME,
})
export class Produto extends Model {
  public static PRODUTO_TABLE_NAME = "produto" as string;
  public static PRODUTO_ID = "id" as string;
  public static PRODUTO_NOME = "nome" as string;
  public static PRODUTO_CONDICAO = "condicao" as string;
  public static PRODUTO_CODIGO_REFERENCIA = "codigo_referencia" as string;
  public static PRODUTO_ESTOQUE_MAXIMO = "estoque_maximo" as string;
  public static PRODUTO_ESTOQUE_MINIMO = "estoque_minimo" as string;
  public static PRODUTO_ESTOQUE_ATUAL = "estoque_atual" as string;
  public static PRODUTO_PRECO = "preco" as string;
  public static PRODUTO_OBSERVACAO = "observacao" as string;
  public static PRODUTO_MARGEM = "margem_lucro" as string;
  public static PRODUTO_CUSTO = "valor_custo" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
    field: Produto.PRODUTO_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(100),
    allowNull: false,
    field: Produto.PRODUTO_NOME,
  })
  nome!: string;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: Produto.PRODUTO_CONDICAO,
  })
  condicao!: string;

  @Column({
    type: DataType.STRING(45),
    allowNull: true,
    field: Produto.PRODUTO_CODIGO_REFERENCIA,
  })
  codigo_referencia!: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: Produto.PRODUTO_ESTOQUE_MAXIMO,
  })
  estoque_maximo!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: Produto.PRODUTO_ESTOQUE_MINIMO,
  })
  estoque_minimo!: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: Produto.PRODUTO_ESTOQUE_ATUAL,
  })
  estoque_atual!: number;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
    field: Produto.PRODUTO_PRECO,
  })
  preco!: number;

  @Column({
    type: DataType.STRING(300),
    allowNull: true,
    field: Produto.PRODUTO_OBSERVACAO,
  })
  observacao!: string;

  @Column({
    type: DataType.DECIMAL(6, 2),
    allowNull: true,
    field: Produto.PRODUTO_MARGEM,
  })
  margem_lucro!: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: true,
    field: Produto.PRODUTO_CUSTO,
  })
  valor_custo!: string;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  usuario_id!: string;

  @BelongsTo(() => Usuario)
  usuario!: Usuario;

  @ForeignKey(() => CategoriaProduto)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  categoria_produto_id!: number;

  @BelongsTo(() => CategoriaProduto, {
    foreignKey: "categoria_produto_id",
    targetKey: "id",
  })
  categoria_produto!: CategoriaProduto;

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

  @ForeignKey(() => Marca)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  marca_id!: number;

  @BelongsTo(() => Marca, {
    foreignKey: "marca_id",
    targetKey: "id",
  })
  marca!: Marca;
}
