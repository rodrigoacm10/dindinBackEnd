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
    tableName: Marca.MARCA_TABLE_NAME,
  })
  export class Marca extends Model {
    public static MARCA_TABLE_NAME = "marca" as string;
    public static MARCA_ID = "id" as string;
    public static MARCA_NOME = "nome" as string;
  
    @Column({
      primaryKey: true,
      type: DataType.INTEGER,
      autoIncrement: true,
      field: Marca.MARCA_ID,
    })
    id!: number;
  
    @Column({
      type: DataType.STRING(45),
      field: Marca.MARCA_NOME,
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
  