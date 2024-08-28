import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Usuario } from "./Usuario";
import { CategoriaDespesa } from "./CategoriaDespesa";
import { Servico } from "./Servico";
import { Produto } from "./Produto";
import { Cliente } from "./Cliente";
import { Estoque } from "./Estoque";

@Table({
  tableName: Despesa.DESPESA_TABLE_NAME,
})
export class Despesa extends Model {
  public static DESPESA_TABLE_NAME = "despesa" as string;
  public static DESPESA_ID = "id" as string;
  public static DESPESA_DESCRICAO = "descricao" as string;
  public static DESPESA_VALOR = "valor" as string;
  public static DESPESA_DATA = "data" as string;
  public static DESPESA_ANEXO = "anexo" as string;
  public static DESPESA_EFETUADO = "efetuado" as string;
  // public static IS_ESTOQUE = "is_estoque" as string;

  @Column({
    primaryKey: true,
    autoIncrement: true,
    field: Despesa.DESPESA_ID,
  })
  id!: number;

  @Column({
    type: DataType.STRING(250),
    allowNull: true,
    field: Despesa.DESPESA_DESCRICAO,
  })
  descricao!: string;

  @Column({
    type: DataType.DECIMAL(12, 2),
    allowNull: false,
    field: Despesa.DESPESA_VALOR,
  })
  valor!: number;

  @Column({
    type: DataType.DATEONLY,
    allowNull: false,
    defaultValue: DataType.NOW,
    field: Despesa.DESPESA_DATA,
  })
  data!: Date;

  @Column({
    type: DataType.STRING(100),
    allowNull: true,
    field: Despesa.DESPESA_ANEXO,
  })
  anexo!: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: true,
    field: Despesa.DESPESA_EFETUADO,
  })
  efetuado!: boolean;

  // @Column({
  //   type: DataType.BOOLEAN,
  //   allowNull: true,
  //   defaultValue: false,
  //   field: Despesa.IS_ESTOQUE,
  // })
  // is_estoque!: boolean;

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

  @ForeignKey(() => CategoriaDespesa)
  @Column({
    type: DataType.INTEGER,
    allowNull: true, //verificar depois se o usuario pode deixar o campo da categoria vazio
    field: "categoria_despesa_id",
  })
  categoria_despesa_id!: number;

  @BelongsTo(() => CategoriaDespesa, {
    foreignKey: "categoria_despesa_id",
    targetKey: "categoria_despesa_id",
  })
  categoriaDespesa!: CategoriaDespesa;

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

  @ForeignKey(() => Estoque)
  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    field: "estoque_id",
  })
  estoque_id!: number;

  @BelongsTo(() => Estoque, {
    foreignKey: "estoque_id",
    targetKey: "id",
  })
  estoque!: Estoque;
}
