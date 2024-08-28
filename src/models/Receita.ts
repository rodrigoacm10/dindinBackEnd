import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Usuario } from "./Usuario";
import { CategoriaReceita } from "./CategoriaReceita";
import { Servico } from "./Servico";
import { Produto } from "./Produto";
import { Cliente } from "./Cliente";
import { Vendas } from "./Vendas";

@Table({
  tableName: Receita.RECEITA_TABLE_NAME,
})
export class Receita extends Model {
  public static RECEITA_TABLE_NAME = "receita" as string;
  public static RECEITA_ID = "id" as string;
  public static RECEITA_DESCRICAO = "descricao" as string;
  public static RECEITA_VALOR = "valor" as string;
  public static RECEITA_DATA = "data" as string;
  public static RECEITA_ANEXO = "anexo" as string;
  public static RECEITA_EFETUADO = "efetuado" as string;
  public static RECEITA_IS_ESTOQUE = "is_estoque" as string;
  // public static RECEITA_ATIVO = "ativo" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    field: Receita.RECEITA_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(250),
    allowNull: true,
    field: Receita.RECEITA_DESCRICAO,
  })
  descricao!: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    field: Receita.RECEITA_VALOR,
    validate: {
      isNumeric: true,
    },
  })
  valor!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: Receita.RECEITA_DATA,
  })
  data!: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Receita.RECEITA_ANEXO,
  })
  anexo!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: Receita.RECEITA_EFETUADO,
  })
  efetuado!: boolean;

  // @Column({
  //   type: DataType.BOOLEAN,
  //   allowNull: false,
  //   defaultValue: true,
  //   field: Receita.RECEITA_ATIVO,
  // })
  // ativo!: boolean;


  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
    field: Receita.RECEITA_IS_ESTOQUE,
  })
  is_estoque!: boolean;

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

  @ForeignKey(() => CategoriaReceita)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, //verificar depois se o usuario pode deixar o campo da categoria vazio
    field: "categoria_receita_id",
  })
  categoria_receita_id!: number;

  @BelongsTo(() => CategoriaReceita, {
    foreignKey: "categoria_receita_id",
    targetKey: "categoria_receita_id",
  })
  categoriaReceita!: CategoriaReceita;

  @ForeignKey(() => Servico)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "servico_id",
  })
  servico_id!: number;

  @BelongsTo(() => Servico, {
    foreignKey: "servico_id",
    targetKey: "id",
  })
  servico!: Servico;

  @ForeignKey(() => Cliente)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "cliente_id",
  })
  cliente_id!: number;

  @BelongsTo(() => Cliente, {
    foreignKey: "cliente_id",
    targetKey: "id",
  })
  cliente!: Cliente;

  @ForeignKey(() => Produto)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "produto_id",
  })
  produto_id!: number;

  @BelongsTo(() => Produto, {
    foreignKey: "produto_id",
    targetKey: "id",
  })
  produto!: Produto;

  @ForeignKey(() => Vendas)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "vendas_id",
  })
  vendas_id!: number;

  @BelongsTo(() => Vendas, {
    foreignKey: "vendas_id",
    targetKey: "id",
  })
  vendas!: Vendas;
}
