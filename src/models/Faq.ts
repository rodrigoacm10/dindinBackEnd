import {
    Model,
    Table,
    Column,
    DataType,
  } from "sequelize-typescript";


  
  @Table({
    tableName: Faq.FAQ_TABLE_NAME,
  })
  export class Faq extends Model {
    public static FAQ_TABLE_NAME = "faq" as string;
    public static FAQ_ID = "id" as string;
    public static FAQ_PERGUNTA = "pergunta" as string;
    public static FAQ_RESPOSTA = "resposta" as string;

  
    @Column({
      primaryKey: true,
      autoIncrement: true,
      field: Faq.FAQ_ID,
    })
    id!: number;
  
    @Column({
      type: DataType.TEXT,
      allowNull: false,
      field: Faq.FAQ_PERGUNTA,
    })
    pergunta!: string;
  
    @Column({
      type: DataType.TEXT,
      allowNull: false,
      field: Faq.FAQ_RESPOSTA,
    })
    resposta!: string;
  }
  