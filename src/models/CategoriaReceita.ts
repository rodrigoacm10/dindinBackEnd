import {
  Model,
  Table,
  Column,
  DataType,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import { Usuario } from "./Usuario";

@Table({
  tableName: CategoriaReceita.CATEGORIA_RECEITA_TABLE_NAME,
})
export class CategoriaReceita extends Model {
  public static CATEGORIA_RECEITA_TABLE_NAME = "categoria_receita" as string;
  public static CATEGORIA_RECEITA_ID = "categoria_receita_id" as string;
  public static CATEGORIA_RECEITA_NOME = "nome" as string;

  @Column({
    primaryKey: true,
    type: DataType.INTEGER,
    autoIncrement: true,
    //allowNull: true,
    field: CategoriaReceita.CATEGORIA_RECEITA_ID,
  })
  categoria_receita_id!: number;

  @Column({
    type: DataType.STRING(45),
    field: CategoriaReceita.CATEGORIA_RECEITA_NOME,
    allowNull: false,
  })
  nome!: string;

  @ForeignKey(() => Usuario)
  @Column({
    type: DataType.UUID,
    field: "usuario_id",
    allowNull: true,
  })
  usuario_id!: string | null;

  @BelongsTo(() => Usuario, {
    foreignKey: "usuario_id",
    targetKey: "usuario_id",
  })
  usuario!: Usuario | null;
}
