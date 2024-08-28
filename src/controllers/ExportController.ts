import { Request, Response } from "express";
import excel from "exceljs";
import { DespesaRepo } from "../repository/DespesaRepo";
import { ReceitaRepo } from "../repository/ReceitaRepo";
import { objetoDeComunicacao } from "../utils/ObjetoDeComunicacao";
import HttpStatusCode from "../utils/HttpStatusCodes";

import { validacaoBuscasOpcionaisReceitaEDespesa } from "../utils/FuncoesUteis";

class ExportController {
  async ExportarTransacoes(req: Request, res: Response) {
    var resultado: objetoDeComunicacao = new objetoDeComunicacao(
      HttpStatusCode.ServerErrorInternal
    );
    try {
      //EXEMPLO DA URL Q TA FUNCIONANDO:
      // http://localhost:3000/export?formato=XLS
      //EU TAVA TENTANDO DESSA FORMA E DEU ERRADO......
      // const dados = await ReceitaEDespesaController.listarTodos(req,res);

      // ESSES FORAM OS DADOS TESTES PARA ENVIAR

      /*const dados = [
        { id: 1, nome: "Exemplo 1" },
        { id: 2, nome: "Exemplo 2" },
        { id: 3, nome: "Exemplo 3" },
        { id: 4, nome: "Exemplo 4" },
        { id: 5, nome: "Exemplo 5" },
        { id: 6, nome: "Exemplo 6" },
        { id: 7, nome: "Exemplo 7" },
        { id: 8, nome: "Exemplo 8" },
      ];
*/

      //   let usuarioId = req.body.token;
      //   delete req.body.token;
      //   usuarioId = usuarioId["usuario_id"];

      //para poder realizar o teste no navegador normal, apenas digita um ID de usuario valido do banco. Na versao final
      //vao ser aquelas 3 linhas logo acima
      let usuarioId = "945248ca-a7b5-4241-9aae-c9498bda5971";

      //ele ta aceitando os dados opcionais acima junto da busca
      resultado = validacaoBuscasOpcionaisReceitaEDespesa(
        req.query.efetuado as string,
        {
          dataInicio: req.query.inicio as string,
          dataFim: req.query.fim as string,
          cliente: req.query.cliente as string,
          produto: req.query.produto as string,
          servico: req.query.servico as string,
          categoria: req.query.categoria as string,
        }
      );

      if (resultado.header != HttpStatusCode.SuccessOK) throw resultado;

      /*  if (!dados) {
        res
          .status(400)
          .json("Você não possui transações entre as datas especificadas");
      }*/

      console.log(resultado);
      let receita: objetoDeComunicacao = await new ReceitaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      let despesa: objetoDeComunicacao = await new DespesaRepo().listarTodas(
        usuarioId,
        resultado.data
      );

      if (req.query.formato == "XLS") {
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=dados_exportados.xlsx`
        );
        res.setHeader(
          "Content-Type",
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        );
        //const xlsFile = await this.exportarXLS(dados);
        console.log("antes enviar arquivo");
        const xlsFile = await this.exportarXLS(receita, despesa);
        res.send(xlsFile);
      } else if (req.query.formato == "CSV") {
        //exportar csv
      } else if (req.query.formato == "PDF") {
        //exportar pdf
      } else {
        res.status(400).json("Formato de arquivo não válido!");
      }
    } catch (error) {
      console.log(error);
      res.status(500).send("Erro ao exportar transacoes");
    }
  }

  private async exportarXLS(
    receita: objetoDeComunicacao,
    despesa: objetoDeComunicacao
  ) {
    return new Promise<Buffer>((resolve, reject) => {
      const workbook = new excel.Workbook();
      //const worksheet = workbook.addWorksheet("Sheet 1");
      const worksheet = workbook.addWorksheet("Receitas");
      console.log("entrou");
      //PRIMEIRAS LINHAS PRA SER O CABEÇALHO
      //worksheet.addRow(["ID", "Nome"]);
      console.log(Object.keys(receita.data[0]));
      worksheet.addRow(Object.keys(receita.data[0]));

      //   receita.forEach((row: any) => {
      //     console.log(row);
      //     //DADOS ADICIONADOS LINHA POR LINHA
      //     worksheet.addRow([row.id, row.nome]);
      //   });

      receita.data.forEach((row: any) => {
        console.log(row);
        //DADOS ADICIONADOS LINHA POR LINHA
        worksheet.addRow(Object.values(row));
      });

      workbook.xlsx
        .writeBuffer()
        .then((buffer) => {
          resolve(Buffer.from(buffer));
        })
        .catch((error) => {
          console.error("Erro ao criar XLS:", error);
          reject("Erro ao gerar arquivo XLS");
        });
    });
  }

  private async exportarCSV(dados: any) {}

  private async exportarPDF(dados: any) {}
}

export default new ExportController();
