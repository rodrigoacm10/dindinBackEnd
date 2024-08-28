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
    tableName: CategoriaProduto.CATEGORIA_PRODUTO_TABLE_NAME,
  })
  export class CategoriaProduto extends Model {
    public static CATEGORIA_PRODUTO_TABLE_NAME = "categoria_produto" as string;
    public static CATEGORIA_PRODUTO_ID = "id" as string;
    public static CATEGORIA_PRODUTO_NOME = "nome" as string;
  
    @Column({
      primaryKey: true,
      type: DataType.INTEGER,
      autoIncrement: true,
      field: CategoriaProduto.CATEGORIA_PRODUTO_ID,
    })
    id!: number;
  
    @Column({
      type: DataType.STRING(45),
      field: CategoriaProduto.CATEGORIA_PRODUTO_NOME,
      allowNull: false,
    })
    nome!: string;
  
      
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
  